import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// Omit projectId from update as it shouldn't be changed after creation
export class UpdateTaskDto extends PartialType(OmitType(CreateTaskDto, ['projectId'])) {}