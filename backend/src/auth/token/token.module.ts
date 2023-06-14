import { Module, forwardRef } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
