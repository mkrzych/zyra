import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTimesheetEntryDto, UpdateTimesheetEntryDto } from './dto';

@Injectable()
export class TimesheetsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, createDto: CreateTimesheetEntryDto) {
    // Verify project exists and belongs to organization
    const project = await this.prisma.project.findFirst({
      where: {
        id: createDto.projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify task exists if provided
    if (createDto.taskId) {
      const task = await this.prisma.task.findFirst({
        where: {
          id: createDto.taskId,
          organizationId,
          projectId: createDto.projectId,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const { date, ...entryData } = createDto;

    return this.prisma.timesheetEntry.create({
      data: {
        ...entryData,
        organizationId,
        userId,
        date: new Date(date),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    organizationId: string, 
    userId?: string,
    projectId?: string,
    from?: string,
    to?: string,
    page = 1, 
    limit = 50
  ) {
    const where = {
      organizationId,
      ...(userId && { userId }),
      ...(projectId && { projectId }),
      ...(from && to && {
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.timesheetEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.timesheetEntry.count({ where }),
    ]);

    // Calculate summary
    const summary = {
      totalMinutes: items.reduce((sum, entry) => sum + entry.minutes, 0),
      billableMinutes: items.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.minutes, 0),
      totalHours: 0,
      billableHours: 0,
    };
    
    summary.totalHours = Math.round((summary.totalMinutes / 60) * 100) / 100;
    summary.billableHours = Math.round((summary.billableMinutes / 60) * 100) / 100;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary,
    };
  }

  async findOne(organizationId: string, id: string) {
    const entry = await this.prisma.timesheetEntry.findFirst({
      where: { id, organizationId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Timesheet entry not found');
    }

    return entry;
  }

  async update(organizationId: string, id: string, updateDto: UpdateTimesheetEntryDto) {
    const entry = await this.prisma.timesheetEntry.findFirst({
      where: { id, organizationId },
    });

    if (!entry) {
      throw new NotFoundException('Timesheet entry not found');
    }

    // Verify task exists if being changed
    if (updateDto.taskId) {
      const task = await this.prisma.task.findFirst({
        where: {
          id: updateDto.taskId,
          organizationId,
          projectId: entry.projectId,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const { date, ...entryData } = updateDto;

    return this.prisma.timesheetEntry.update({
      where: { id },
      data: {
        ...entryData,
        date: date ? new Date(date) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const entry = await this.prisma.timesheetEntry.findFirst({
      where: { id, organizationId },
    });

    if (!entry) {
      throw new NotFoundException('Timesheet entry not found');
    }

    return this.prisma.timesheetEntry.delete({
      where: { id },
    });
  }

  async getWeeklySummary(organizationId: string, userId?: string, weekStart?: string) {
    // Default to current week if no week specified
    const start = weekStart ? new Date(weekStart) : this.getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const entries = await this.prisma.timesheetEntry.findMany({
      where: {
        organizationId,
        ...(userId && { userId }),
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Group by day and project
    const dailySummary = {};
    const projectSummary = {};

    entries.forEach(entry => {
      const dayKey = entry.date.toISOString().split('T')[0];
      const projectKey = entry.projectId;

      // Daily summary
      if (!dailySummary[dayKey]) {
        dailySummary[dayKey] = { totalMinutes: 0, billableMinutes: 0, entries: [] };
      }
      dailySummary[dayKey].totalMinutes += entry.minutes;
      if (entry.billable) dailySummary[dayKey].billableMinutes += entry.minutes;
      dailySummary[dayKey].entries.push(entry);

      // Project summary
      if (!projectSummary[projectKey]) {
        projectSummary[projectKey] = {
          project: entry.project,
          totalMinutes: 0,
          billableMinutes: 0,
        };
      }
      projectSummary[projectKey].totalMinutes += entry.minutes;
      if (entry.billable) projectSummary[projectKey].billableMinutes += entry.minutes;
    });

    const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
    const billableMinutes = entries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.minutes, 0);

    return {
      weekStart: start,
      weekEnd: end,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      billableHours: Math.round((billableMinutes / 60) * 100) / 100,
      dailySummary,
      projectSummary: Object.values(projectSummary),
    };
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
    return new Date(d.setDate(diff));
  }
}