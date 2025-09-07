import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('org')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization details' })
  async getCurrent(@CurrentUser() user: AuthUser) {
    return this.organizationsService.findById(user.organizationId);
  }
}