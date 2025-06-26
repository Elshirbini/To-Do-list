import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
