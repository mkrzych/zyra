import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  IsDateString,
  IsNumber,
  Min,
  IsHexColor
} from 'class-validator';

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Project code (unique within organization)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Project description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Client ID', required: false })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({ 
    description: 'Project status', 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNED
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ description: 'Budget in hours', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetHours?: number;

  @ApiProperty({ description: 'Budget amount', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budgetAmount?: number;

  @ApiProperty({ description: 'Default hourly rate', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: 'Project start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Project end date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Project color (hex)', required: false })
  @IsOptional()
  @IsHexColor()
  color?: string;
}