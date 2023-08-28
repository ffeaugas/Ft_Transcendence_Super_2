import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChannelInvitationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the channel' })
  channelName: string;
  @IsString({
    message: 'Invited user must be a string ',
  })
  @ApiProperty({ description: 'User invited to the channel' })
  userToInvite?: string;
}
