import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from '../database/users/users.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  async handleConnection(socket: Socket) {
    const username = socket.handshake.query.username as string;
    if (username) {
      socket.data.username = username;
      this.server.emit('userConnected', { username });
    }
  }

  async handleDisconnect(socket: Socket) {
    const username = socket.data.username;
    if (username) {
      this.server.emit('userDisconnected', { username });
    }
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(client: Socket, payload: { receiver: string; content: string }) {
    const sender = client.data.username;
    
    try {
      // Create the private message in the database
      const message = await this.chatService.createPrivateMessage(sender, payload.receiver, payload.content);

      // Emit the message to the sender and receiver
      client.emit('privateMessage', message); // Emit to sender
      const receiverSocket = await this.findSocketByUsername(payload.receiver);
      if (receiverSocket) {
        receiverSocket.emit('privateMessage', message); // Emit to receiver if online
      }

    } catch (error) {
      console.error('Error handling private message:', error);
    }
  }

  @SubscribeMessage('groupMessage')
  async handleGroupMessage(client: Socket, payload: { groupId: number; content: string }) {
    const sender = client.data.username;
    try {
      // Create the group message in the database
      const message = await this.chatService.createGroupMessage(sender, payload.groupId, payload.content);

      // Emit the group message to all members of the group
      this.server.to(`group_${payload.groupId}`).emit('groupMessage', message);

    } catch (error) {
      console.error('Error handling group message:', error);
    }
  }

  @SubscribeMessage('joinGroup')
  async handleJoinGroup(client: Socket, payload: { groupId: number }) {
    const username = client.data.username;
    try {
      // Add user to the group in the database
      const group = await this.chatService.addUserToGroup(username, payload.groupId);

      // Join the client socket to the group room
      client.join(`group_${payload.groupId}`);

      // Emit events to notify clients
      client.to(`group_${payload.groupId}`).emit('userJoined', { username });
      client.emit('joinedGroup', group);

    } catch (error) {
      console.error('Error handling join group:', error);
    }
  }

  // Helper function to find socket by username
  private async findSocketByUsername(username: string) {
    const connectedSockets = await this.server.fetchSockets();
    return connectedSockets.find(socket => socket.data.username === username) || null;
  }
}
