import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import{CreateUserDto} from './dto/create-user.dto'
@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
    @ApiBody({type:CreateUserDto})
  async register(@Body() body: { username: string; password: string }): Promise<User> {
    return this.userService.create(body.username, body.password);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
  
   @Get('recent/:id')
  async findRecent(@Param('id') id: number): Promise<User[]> {
    return this.userService.findRecentChatUsers(id);
   }
  
  @Post('login')
  @ApiBody({type:CreateUserDto})
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.userService.validateUser(loginDto.username, loginDto.password);
    return { id: user.id, username: user.username };
  }
}
