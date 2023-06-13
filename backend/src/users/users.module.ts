import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { MulterModule } from '@nestjs/platform-express';
import { TokenModule } from 'src/auth/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend]),
    MulterModule.register({
      dest: '../data/profile',
    }),
    forwardRef(() => TokenModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
