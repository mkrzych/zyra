import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskOrderDto, TaskStatus, Priority } from './dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createTaskDto: CreateTaskDto) {
    // Verify project exists and belongs to organization
    const project = await this.prisma.project.findFirst({
      where: {
        id: createTaskDto.projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify parent task exists if provided
    if (createTaskDto.parentId) {
      const parentTask = await this.prisma.task.findFirst({
        where: {
          id: createTaskDto.parentId,
          organizationId,
          projectId: createTaskDto.projectId,
        },
      });

      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }
    }

    // Verify assignees exist if provided
    if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: createTaskDto.assigneeIds },
          organizationId,
        },
      });

      if (users.length !== createTaskDto.assigneeIds.length) {
        throw new NotFoundException('One or more assignees not found');
      }
    }

    const { assigneeIds, dueDate, ...taskData } = createTaskDto;

    // Get next order index if not provided
    let orderIndex = createTaskDto.orderIndex;
    if (orderIndex === undefined) {
      const lastTask = await this.prisma.task.findFirst({
        where: {
          organizationId,
          projectId: createTaskDto.projectId,
          status: createTaskDto.status || TaskStatus.TODO,
        },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = lastTask ? lastTask.orderIndex + 1 : 0;
    }

    return this.prisma.task.create({
      data: {
        ...taskData,
        organizationId,
        dueDate: dueDate ? new Date(dueDate) : null,
        orderIndex,
        assignees: assigneeIds ? {
          connect: assigneeIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        assignees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            timesheetEntries: true,
          },
        },
      },
    });
  }

  async findAll(
    organizationId: string, 
    projectId?: string,
    status?: TaskStatus,
    assigneeId?: string,
    page = 1, 
    limit = 50,
    search?: string
  ) {
    const where = {
      organizationId,
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(assigneeId && {
        assignees: {
          some: {
            id: assigneeId,
          },
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { status: 'asc' },
          { orderIndex: 'asc' },
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
          assignees: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
              timesheetEntries: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getKanbanBoard(organizationId: string, projectId: string) {
    // Verify project exists and belongs to organization
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        organizationId,
        projectId,
      },
      orderBy: [
        { status: 'asc' },
        { orderIndex: 'asc' },
      ],
      include: {
        assignees: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            timesheetEntries: true,
          },
        },
      },
    });

    // Group tasks by status
    const board = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    tasks.forEach(task => {
      if (board[task.status]) {
        board[task.status].push(task);
      }
    });

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
      },
      board,
    };
  }

  async findOne(organizationId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        assignees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
        _count: {
          select: {
            subtasks: true,
            timesheetEntries: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(organizationId: string, id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify parent task exists if being changed
    if (updateTaskDto.parentId) {
      const parentTask = await this.prisma.task.findFirst({
        where: {
          id: updateTaskDto.parentId,
          organizationId,
          projectId: task.projectId,
        },
      });

      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }

      // Prevent circular references
      if (updateTaskDto.parentId === id) {
        throw new ForbiddenException('Task cannot be its own parent');
      }
    }

    // Verify assignees exist if being changed
    if (updateTaskDto.assigneeIds && updateTaskDto.assigneeIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: updateTaskDto.assigneeIds },
          organizationId,
        },
      });

      if (users.length !== updateTaskDto.assigneeIds.length) {
        throw new NotFoundException('One or more assignees not found');
      }
    }

    const { assigneeIds, dueDate, ...taskData } = updateTaskDto;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignees: assigneeIds ? {
          set: assigneeIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        assignees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            timesheetEntries: true,
          },
        },
      },
    });
  }

  async updateOrder(organizationId: string, updateOrderDto: UpdateTaskOrderDto) {
    // Verify all tasks exist and belong to the organization
    const taskIds = updateOrderDto.tasks.map(t => t.id);
    const existingTasks = await this.prisma.task.findMany({
      where: {
        id: { in: taskIds },
        organizationId,
      },
    });

    if (existingTasks.length !== taskIds.length) {
      throw new NotFoundException('One or more tasks not found');
    }

    // Update order indices in a transaction
    await this.prisma.$transaction(
      updateOrderDto.tasks.map(taskOrder =>
        this.prisma.task.update({
          where: { id: taskOrder.id },
          data: { orderIndex: taskOrder.orderIndex },
        })
      )
    );

    return { success: true };
  }

  async remove(organizationId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            subtasks: true,
            timesheetEntries: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if task has subtasks or time entries
    if (task._count.subtasks > 0) {
      throw new ForbiddenException('Cannot delete task with subtasks');
    }

    if (task._count.timesheetEntries > 0) {
      throw new ForbiddenException('Cannot delete task with time entries');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }
}