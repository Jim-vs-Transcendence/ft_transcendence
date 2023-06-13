import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { auth42Strategy } from './auth42.strategy';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Friend } from 'src/users/entities/friend.entity';
import { UsersModule } from 'src/users/users.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: '42' }),
    TypeOrmModule.forFeature([User, Friend]),
    UsersModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, auth42Strategy],
})
export class AuthModule {}
