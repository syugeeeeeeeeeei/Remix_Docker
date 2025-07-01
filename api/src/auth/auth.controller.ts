import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // 👈 追加
import { User } from '@prisma/client'; // 👈 追加
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	//--- 👇 ここから追加 ---
	@UseGuards(AuthGuard('local')) // 👈 LocalStrategy を使用する
	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Request() req: { user: Omit<User, 'password'> }) {
		// LocalStrategyのvalidateメソッドが成功すると、
		// req.userにそのユーザー情報が格納される
		return this.authService.login(req.user);
	}
	//--- 👆 ここまで ---
}