import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelDto } from './dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('channels')
@ApiBearerAuth()
@ApiTags('channels')
@UseGuards(AuthGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  async getAllUsers(@Query('name') channelName: string) {
    return await this.channelsService.getAllUsers(channelName);
  }

  @Get('publics')
  async getAllPublic() {
    return await this.channelsService.getAllPublic();
  }

  @Post()
  async createChannel(@Body() dto: ChannelDto) {
    return await this.channelsService.createChannel(dto);
  }

  @Patch('add')
  @ApiQuery({
    name: 'channelName',
    description: 'Channel name for adding user.',
  })
  @ApiQuery({
    name: 'userName',
    description: 'The username to add in the channel.',
  })
  async addUserByUsername(
    @Query('channelName') channelName: string,
    @Query('userName') userName: string,
  ) {
    return await this.channelsService.addUserByUsername(channelName, userName);
  }

  @Patch('change-mode')
  @ApiResponse({
    status: 201,
    description: 'The channel mode has been successfully changed.',
  })
  @ApiResponse({
    status: 403,
    description: "User isn't owner channel Forbidden.",
  })
  async changeChannelMode(
    @Req() req: Request,
    @Query('channelName') channelName: string,
    @Query('mode') mode: string,
  ) {
    return await this.channelsService.changeChannelMode(req, channelName, mode);
  }
}
