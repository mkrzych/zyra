import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetEntryDto, UpdateTimesheetEntryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
}

@ApiTags('timesheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new timesheet entry' })
  @ApiResponse({ status: 201, description: 'Timesheet entry created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project or task not found' })
  create(@CurrentUser() user: User, @Body() createDto: CreateTimesheetEntryDto) {
    return this.timesheetsService.create(user.organizationId, user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get timesheet entries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user' })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Timesheet entries retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.timesheetsService.findAll(
      user.organizationId,
      userId,
      projectId,
      from,
      to,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly timesheet summary' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user' })
  @ApiQuery({ name: 'weekStart', required: false, type: String, description: 'Week start date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Weekly summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklySummary(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
    @Query('weekStart') weekStart?: string,
  ) {
    return this.timesheetsService.getWeeklySummary(
      user.organizationId,
      userId,
      weekStart,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a timesheet entry by ID' })
  @ApiResponse({ status: 200, description: 'Timesheet entry retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Timesheet entry not found' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.timesheetsService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a timesheet entry' })
  @ApiResponse({ status: 200, description: 'Timesheet entry updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Timesheet entry not found' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateTimesheetEntryDto,
  ) {
    return this.timesheetsService.update(user.organizationId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timesheet entry' })
  @ApiResponse({ status: 200, description: 'Timesheet entry deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Timesheet entry not found' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.timesheetsService.remove(user.organizationId, id);
  }
}