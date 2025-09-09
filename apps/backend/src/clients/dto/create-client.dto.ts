import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ description: 'Client name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Client email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Client phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Client address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Client billing address', required: false })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiProperty({ description: 'Tax ID or VAT number', required: false })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ description: 'Notes about the client', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Whether the client is active', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}