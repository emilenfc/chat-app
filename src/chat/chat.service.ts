import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../database/message/entities/message.entity';
import { Group } from '../database/group/entities/group.entity';
import { UserService } from '../database/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private userService: UserService,
  ) {}

  async createPrivateMessage(senderUsername: string, receiverUsername: string, content: string): Promise<Message> {
    const sender = await this.userService.findByUsername(senderUsername);
    const receiver = await this.userService.findByUsername(receiverUsername);
    const message = this.messageRepository.create({ content, sender, receiver });
    return this.messageRepository.save(message);
  }

  async createGroupMessage(senderUsername: string, groupId: number, content: string): Promise<Message> {
    const sender = await this.userService.findByUsername(senderUsername);
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    const message = this.messageRepository.create({ content, sender, group });
    return this.messageRepository.save(message);
  }

  async addUserToGroup(username: string, groupId: number): Promise<Group> {
    const user = await this.userService.findByUsername(username);
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['members'] });
    group.members.push(user);
    return this.groupRepository.save(group);
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    return this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.members', 'member')
      .where('member.id = :userId', { userId })
      .getMany();
  }

 async getPrivateChatHistory(user1Id: number, user2Id: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { sender: { id: user1Id }, receiver: { id: user2Id } },
        { sender: { id: user2Id }, receiver: { id: user1Id } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
 }
  
  async getGroupChatHistory(groupId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { group: { id: groupId } },
      order: { createdAt: 'ASC' },
      relations: ['sender', 'group'],
    });
  }
}
