import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectStatus } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createProjectDto: CreateProjectDto) {
    // Check if code is unique within organization
    const existingProject = await this.prisma.project.findFirst({
      where: {
        organizationId,
        code: createProjectDto.code,
      },
    });

    if (existingProject) {
      throw new ConflictException('Project code already exists in this organization');
    }

    // Verify client exists if provided
    if (createProjectDto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: {
          id: createProjectDto.clientId,
          organizationId,
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    const { startDate, endDate, ...projectData } = createProjectDto;

    return this.prisma.project.create({
      data: {
        ...projectData,
        organizationId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timesheetEntries: true,
            expenses: true,
          },
        },
      },
    });
  }

  async findAll(organizationId: string, page = 1, limit = 10, search?: string, status?: ProjectStatus, clientId?: string) {
    const where = {
      organizationId,
      active: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              timesheetEntries: true,
              expenses: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(organizationId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignees: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        timesheetEntries: {
          select: {
            id: true,
            date: true,
            minutes: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
        expenses: {
          select: {
            id: true,
            date: true,
            amount: true,
            currency: true,
            description: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            tasks: true,
            timesheetEntries: true,
            expenses: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getSummary(organizationId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get time tracking summary
    const timeEntries = await this.prisma.timesheetEntry.findMany({
      where: {
        organizationId,
        projectId: id,
      },
    });

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.minutes, 0) / 60;
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.minutes, 0) / 60;

    // Get expense summary
    const expenses = await this.prisma.expense.findMany({
      where: {
        organizationId,
        projectId: id,
      },
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const billableExpenses = expenses
      .filter(expense => expense.billable)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    // Get task summary
    const taskCounts = await this.prisma.task.groupBy({
      by: ['status'],
      where: {
        organizationId,
        projectId: id,
      },
      _count: true,
    });

    const taskSummary = taskCounts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        budgetHours: project.budgetHours,
        budgetAmount: project.budgetAmount,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      timeTracking: {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        budgetHours: project.budgetHours,
        remainingBudgetHours: project.budgetHours 
          ? Math.max(0, project.budgetHours - totalHours)
          : null,
      },
      expenses: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        billableExpenses: Math.round(billableExpenses * 100) / 100,
        budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : null,
        remainingBudget: project.budgetAmount 
          ? Math.max(0, Number(project.budgetAmount) - totalExpenses)
          : null,
      },
      tasks: taskSummary,
    };
  }

  async update(organizationId: string, id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check code uniqueness if being updated
    if (updateProjectDto.code && updateProjectDto.code !== project.code) {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          organizationId,
          code: updateProjectDto.code,
          NOT: { id },
        },
      });

      if (existingProject) {
        throw new ConflictException('Project code already exists in this organization');
      }
    }

    // Verify client exists if provided
    if (updateProjectDto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: {
          id: updateProjectDto.clientId,
          organizationId,
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    const { startDate, endDate, ...projectData } = updateProjectDto;

    return this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timesheetEntries: true,
            expenses: true,
          },
        },
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Soft delete by setting active to false
    return this.prisma.project.update({
      where: { id },
      data: { active: false },
    });
  }
}