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
      host: this.configService.get<string>('POSTGRES_HOST_BACKEND'),
      port: this.configService.get<number>('POSTGRES_PORT'),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB'),
      synchronize: this.configService.get<boolean>('POSTGRES_SYNC'),
      logging: this.configService.get<boolean>('POSTGRES_LOG'),
      entities: [User, Friend, MatchHistory],
    };
  }
}
