import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth42/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { TokenModule } from './auth/token/token.module';
import { Friend } from './users/entities/friend.entity';
import { FriendModule } from './users/friend/friend.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { TwoFactorModule } from './auth/two-factor/two-factor.module';

@Module({
  imports: [
    GameModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, // +를 붙여 int형으로 변환
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOG === 'true',
      entities: [User, Friend],
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
