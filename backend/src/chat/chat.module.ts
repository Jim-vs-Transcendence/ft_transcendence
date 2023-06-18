import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ChatGateway]
})
export class ChatModule {}
