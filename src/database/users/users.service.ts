import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Message } from '../message/entities/message.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
      @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(username: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
async findRecentChatUsers(userId: number): Promise<User[]> {
  const messages = await this.messageRepository.find({
    where: [
      { sender: { id: userId } },
      { receiver: { id: userId } },
    ],
    relations: ['sender', 'receiver'],
  });
console.log("messages", messages)
  const users = new Map<number, User>();

  messages.forEach((message) => {
    if (message.sender.id !== userId) {
      users.set(message.sender.id, message.sender);
    } else if (message.receiver && message.receiver.id !== userId) {
      users.set(message.receiver.id, message.receiver);
    }
  });

  return Array.from(users.values());
}
}
