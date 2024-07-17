import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/users/entities/user.entity';
import { Group } from './database/group/entities/group.entity';
import { Message } from './database/message/entities/message.entity';
import { ChatService } from './chat/chat.service';
import { UserService } from './database/users/users.service';
import { UserController } from './database/users/users.controller';
import { ChatController } from './chat/chat.controller';
@Module({
  imports: [
     ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, Group, Message]),

  ],
  controllers: [AppController, UserController,ChatController],
  providers: [AppService, ChatGateway,ChatService, UserService],
})
export class AppModule { }
