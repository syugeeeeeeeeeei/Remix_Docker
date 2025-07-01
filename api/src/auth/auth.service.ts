import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) { }

	//--- 👇 ここから追加 ---
	/**
	 * メールアドレスとパスワードが一致するか検証する
	 */
	async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
		const user = await this.usersService.findOneByEmail(email);
		if (user && await bcrypt.compare(pass, user.password)) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	/**
	 * ログイン処理を行い、アクセストークンを発行する
	 */
	async login(user: Omit<User, 'password'>) {
		const payload = { sub: user.id, email: user.email };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
	//--- 👆 ここまで ---

	async register(createUserDto: CreateUserDto) {
		const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
		if (existingUser) {
			throw new ConflictException('Email already exists');
		}
		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const user = await this.usersService.create({
			...createUserDto,
			password: hashedPassword,
		});
		const { password, ...result } = user;
		return result;
	}
}