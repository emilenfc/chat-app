import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, BaseEntity, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import{ Message } from '../../message/entities/message.entity';

@Entity()
export class Group extends BaseEntity{
    @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.groups)
  creator: User;

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  @OneToMany(() => Message, (message) => message.group)
  messages: Message[];
}
