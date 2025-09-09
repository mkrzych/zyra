import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...createClientDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page = 1, limit = 10, search?: string) {
    const where = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              projects: true,
              invoices: true,
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
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
    const client = await this.prisma.client.findFirst({
      where: { id, organizationId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            issueDate: true,
            dueDate: true,
          },
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(organizationId: string, id: string, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.client.findFirst({
      where: { id, organizationId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(organizationId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, organizationId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }
}