import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth42/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './auth/token/token.module';
import { FriendModule } from './users/friend/friend.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
<<<<<<< HEAD
=======
import { TwoFactorModule } from './auth/two-factor/two-factor.module';
import { typeOrmConfigService } from './configs/typeorm.config';
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979

@Module({
  imports: [
    GameModule,
<<<<<<< HEAD
    AuthModule,
=======
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
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
<<<<<<< HEAD
    // ChatModule,
=======
    ChatModule,
    TwoFactorModule,
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
