import { IsNotEmpty, IsString, Length } from 'class-validator';

export class PasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 16)
  password: string;
}
