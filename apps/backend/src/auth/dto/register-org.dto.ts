import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOrgDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @MaxLength(100)
  organizationName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(100)
  adminName: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}