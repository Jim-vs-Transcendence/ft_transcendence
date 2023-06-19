import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { auth42Strategy } from './auth42.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: '42' }),
    UsersModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, auth42Strategy],
})
export class AuthModule {}
