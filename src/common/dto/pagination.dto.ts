import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'; // Default desc

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  fromDate?: string;

  @IsOptional()
  toDate?: string;

  @IsOptional()
  @IsString()
  filter?: string;
}
