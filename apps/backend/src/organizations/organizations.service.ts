import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }
}