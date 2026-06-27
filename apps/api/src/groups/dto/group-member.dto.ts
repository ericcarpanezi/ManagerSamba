import { IsNotEmpty, IsString } from 'class-validator';

export class GroupMemberDto {
  @IsString()
  @IsNotEmpty()
  memberName!: string;
}
