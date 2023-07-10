import {
  Controller,
  Get,
  Headers,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard42 } from './auth42.guard';
import { AuthService } from './auth.service';
import { AuthFilter42 } from './auth42.filter';
import RequestWithUserDTO from '../interfaces/RequestWithUserDTO.interface';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard42)
  login(): void {}

  @Get('42/callback')
  @UseGuards(AuthGuard42)
  @UseFilters(AuthFilter42)
  async login42(
    @Req() req: RequestWithUserDTO,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.login(req, res);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logout(req, res);
  }
}
