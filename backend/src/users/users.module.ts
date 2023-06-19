import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { TokenModule } from 'src/auth/token/token.module';
import { MatchHistoryModule } from './match-history/match-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      dest: '../data/profile',
    }),
    forwardRef(() => TokenModule),
    forwardRef(() => MatchHistoryModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
