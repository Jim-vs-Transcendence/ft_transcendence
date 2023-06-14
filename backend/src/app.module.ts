import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth42/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './auth/token/token.module';
import { FriendModule } from './users/friend/friend.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { TwoFactorModule } from './auth/two-factor/two-factor.module';
import { typeOrmConfigService } from './configs/typeorm.config';

@Module({
  imports: [
    GameModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: typeOrmConfigService,
    }),
    AuthModule,
    UsersModule,
    TokenModule,
    FriendModule,
    ChatModule,
    TwoFactorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
