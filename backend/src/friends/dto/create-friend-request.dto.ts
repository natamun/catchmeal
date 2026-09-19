import { IsInt, IsPositive } from 'class-validator';

export class CreateFriendRequestDto {
  @IsInt()
  @IsPositive()
  friendId: number;
}
