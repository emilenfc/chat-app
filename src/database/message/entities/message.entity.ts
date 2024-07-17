import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../group/entities/group.entity';
@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
   id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  receiver: User;

  @ManyToOne(() => Group, (group) => group.messages, { nullable: true })
  group: Group;

  @CreateDateColumn()
  createdAt: Date;
}