import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTimesheetEntryDto } from './create-timesheet-entry.dto';

// Omit projectId from update as it shouldn't be changed after creation
export class UpdateTimesheetEntryDto extends PartialType(OmitType(CreateTimesheetEntryDto, ['projectId'])) {}