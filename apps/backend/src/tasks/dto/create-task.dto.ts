import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  IsDateString,
  IsArray,
  Min,
  ArrayMaxSize
} from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Task description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Parent task ID (for subtasks)', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ 
    description: 'Task status', 
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ 
    description: 'Task priority', 
    enum: Priority,
    default: Priority.MEDIUM
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ 
    description: 'Task tags',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Estimated hours', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedHours?: number;

  @ApiProperty({ 
    description: 'User IDs to assign to this task',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  assigneeIds?: string[];

  @ApiProperty({ description: 'Order index for sorting', required: false })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}