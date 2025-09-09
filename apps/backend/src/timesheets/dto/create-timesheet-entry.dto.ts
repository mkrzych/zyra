import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  IsDateString,
  IsNumber,
  Min,
  Max
} from 'class-validator';

export class CreateTimesheetEntryDto {
  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Task ID (optional)', required: false })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiProperty({ description: 'Date of work (ISO string)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @Max(24 * 60) // Max 24 hours per entry
  minutes: number;

  @ApiProperty({ description: 'Whether this time is billable', default: true })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @ApiProperty({ description: 'Hourly rate for this entry', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: 'Notes about the work performed', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}