import { ForbiddenException, Injectable } from '@nestjs/common';
import { Users } from './users.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/profile/profile.service';
import { AuthDto } from 'src/auth/dto';
import { Request } from 'express';
import * as argon from 'argon2';
import { ChannelMode } from '@prisma/client';
import { UserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  async createUser(dto: AuthDto, user42: boolean): Promise<Users> {
    const passwordHash: string = await argon.hash(dto.password);
    const newUser = await this.prismaService.user.create({
      data: {
        username: dto.username,
        hash: passwordHash,
        user42: user42,
        // friendList: {
        //   create: {},
        // },
      },
      // include: {
      //   friendList: true,
      // },
    });
    // const updatedUser = await this.prismaService.user.update({
    //   where: { id: newUser.id },
    //   data: {
    //     friendListId: newUser.friendList.id,
    //   },
    // });
    await this.prismaService.profile.create({
      data: {
        userId: newUser.id,
      },
    });
    delete newUser.hash;
    return newUser;
  }

  // async addFriend(req: any, dto: UserDto) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: { username: req.user.username },
  //   });
  //   if (!user) throw new ForbiddenException('User not found.');
  //   const friendListToUpdate = await this.prismaService.friendList.findUnique({
  //     where: { id: user.friendListId },
  //     include: { user: true },
  //   });
  //   if (!friendListToUpdate)
  //     throw new ForbiddenException('Friend list not found.');
  //   const friendToAdd = await this.prismaService.user.findUnique({
  //     where: { username: dto.username },
  //   });
  //   if (!friendToAdd) throw new ForbiddenException('User not found.');
  //   const updatedUsers = [friendToAdd];
  //   await this.prismaService.friendList.update({
  //     where: { id: friendListToUpdate.id },
  //     data: { user: { connect: updatedUsers } },
  //   });
  // }

  async getPrivateChannels(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: { username: username },
    });
    if (!user) throw new ForbiddenException('User not found');
    const privateChannels = await this.prismaService.channel.findMany({
      where: { mode: ChannelMode.PRIVATE || ChannelMode.PROTECTED },
    });
    if (!privateChannels)
      throw new ForbiddenException('No private channels found.');
    return privateChannels;
  }

  async getByUsername(username: string): Promise<Users> {
    const user = await this.prismaService.user.findUnique({
      where: { username: username },
    });
    if (!user) throw new ForbiddenException('User not found');
    return user;
  }

  async getMe(req: Request): Promise<Users> {
    const username = req['user'].username;
    const user = await this.prismaService.user.findUnique({
      where: { username: username },
      include: { channels: true },
    });
    if (!user) throw new ForbiddenException('User not found');
    delete user.hash;
    return user;
  }

  async getAll(): Promise<Users[]> {
    const users = await this.prismaService.user.findMany();
    if (!users) throw new ForbiddenException('Users not found');
    users.forEach((user) => delete user.hash);
    return users;
  }

  async getById(id: number): Promise<Users> {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
    });
    if (!user) throw new ForbiddenException('User not found');
    delete user.hash;
    return user;
  }

  async getAllUsers(): Promise<Users[]> {
    const users = await this.prismaService.user.findMany({
      include: {
        channels: true,
        channelsOwned: true,
      },
    });
    if (users.length <= 0) throw new ForbiddenException('No users found');
    users.forEach((user) => {
      delete user.hash;
    });
    return users;
  }

  async deleteByUsername(username: string) {
    await this.profileService.deleteProfileByUsername(username);
    return await this.prismaService.user.delete({
      where: { username: username },
    });
  }

  async deleteById(id: number) {
    await this.profileService.deleteProfileById(id);
    return await this.prismaService.user.delete({
      where: { id: id },
    });
  }

  async deleteAllUsers() {
    await this.profileService.deleteAllProfiles();
    return await this.prismaService.user.deleteMany();
  }
}
