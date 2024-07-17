import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, BaseEntity, OneToMany } from 'typeorm';
import { Message } from '../../message/entities/message.entity';import { Group } from '../../group/entities/group.entity';

@Entity()
export class User  extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Group, (group) => group.creator)
  groups: Group[];
}
