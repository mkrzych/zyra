import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma.service';
import { RegisterOrgDto } from './dto/register-org.dto';
import { LoginDto } from './dto/login.dto';

// Temporary enum until Prisma client is generated
enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  CLIENT = 'CLIENT',
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerOrganization(registerOrgDto: RegisterOrgDto) {
    const { organizationName, adminName, email, password } = registerOrgDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create organization and admin user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email,
          name: adminName,
          role: UserRole.ADMIN,
          passwordHash,
        },
      });

      return { organization, user };
    });

    // Generate JWT token
    const payload = {
      sub: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      role: result.user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.organization.id,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, active: true },
      include: { organization: true },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
    };
  }
}