import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Friend } from 'src/users/entities/friend.entity';
import { MatchHistory } from 'src/users/entities/matchHistory.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class typeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      synchronize: this.configService.get('DB_SYNC') === 'true',
      logging: this.configService.get('DB_LOG') === 'true',
      entities: [User, Friend, MatchHistory],
    };
  }
}
