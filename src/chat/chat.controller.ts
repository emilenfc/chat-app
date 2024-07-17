import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Group } from '../database/group/entities/group.entity';
import { Message } from 'src/database/message/entities/message.entity';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

    @Get('groups/:userId')
   @ApiParam({ name: 'userId', type: Number })
  async getUserGroups(@Param('userId') userId: number): Promise<Group[]> {
    return this.chatService.getUserGroups(userId);
  }
    @Get('private/:user1Id/:user2Id')
    @ApiParam({ name: 'user1Id', type: Number })
    @ApiParam({ name: 'user2Id', type: Number })
  async getPrivateChatHistory(
    @Param('user1Id') user1Id: number,
    @Param('user2Id') user2Id: number,
  ): Promise<Message[]> {
    return this.chatService.getPrivateChatHistory(user1Id, user2Id);
  }

    @Get('group/:groupId')
    @ApiParam({ name: 'groupId', type: Number })
  async getGroupChatHistory(@Param('groupId') groupId: number): Promise<Message[]> {
    return this.chatService.getGroupChatHistory(groupId);
  }
}
