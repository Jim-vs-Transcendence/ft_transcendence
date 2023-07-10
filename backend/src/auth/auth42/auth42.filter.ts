import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(UnauthorizedException)
export class AuthFilter42 implements ExceptionFilter {
    constructor(
    private readonly configService: ConfigService,
  ) {}
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const status: number = exception.getStatus();

    response.status(status).redirect(this.configService.get<string>('FRONTEND_URL'));
  }
}
