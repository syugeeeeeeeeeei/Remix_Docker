import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		// passport-localはデフォルトで'username'と'password'を要求するため、
		// 'username'フィールドとして'email'を使うよう設定
		super({ usernameField: 'email' });
	}

	async validate(email: string, pass: string): Promise<Omit<User, 'password'>> {
		const user = await this.authService.validateUser(email, pass);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}