import { Controller, Get, Headers, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard42 } from './auth42.guard';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) {}

	@Get('login')
	@UseGuards(AuthGuard42)
	async login() {}

	@Get('42/callback')
	@UseGuards(AuthGuard42)
	async login42(@Req() req: Request, @Res() res: Response) {
		this.authService.login({req, res});
	}

	@Get('logout')
	async logout(@Headers('authtoken') token: string) {
		this.authService.logout(token);
	}
}
