import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, MinLength, Matches } from 'class-validator';
import { IsMobilePhone10 } from '../../../common/validators/is-mobile-phone-10.validator';

export class SignupAcademyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  adminPassword: string;

  @IsOptional()
  @IsString()
  @IsMobilePhone10()
  phone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  directorSignatureUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  institutionType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  institutionTypes?: string[];

  @IsOptional()
  @IsString()
  educationBoard?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  educationBoards?: string[];
}
