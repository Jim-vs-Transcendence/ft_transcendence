import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { TokenModule } from 'src/auth/token/token.module';

@Module({
  imports: [UsersModule, TokenModule],
  providers: [ChatGateway]
})
export class ChatModule {}
