import { IsNotEmpty, IsString } from 'class-validator';

export class MoveUserDto {
  @IsString()
  @IsNotEmpty()
  targetOuDn!: string;
}
