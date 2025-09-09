import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class TaskOrderItem {
  @ApiProperty({ description: 'Task ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'New order index' })
  @IsInt()
  orderIndex: number;
}

export class UpdateTaskOrderDto {
  @ApiProperty({ 
    description: 'Array of task IDs with their new order indices',
    type: [TaskOrderItem]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOrderItem)
  tasks: TaskOrderItem[];
}