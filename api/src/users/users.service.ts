// api/src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException を追加
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // bcrypt をインポート
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) { }

	async create(data: Prisma.UserCreateInput): Promise<User> {
		return this.prisma.user.create({
			data,
		});
	}

	async findOneByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}

	// --- 👇 ここから追加 ---
	/**
	 * IDを指定してユーザーを1件取得する
	 */
	async findOneById(id: number): Promise<Omit<User, 'password'> | null> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		const { password, ...result } = user;
		return result;
	}

	/**
	 * ユーザー情報を更新する
	 */
	async update(
		userId: number,
		data: Prisma.UserUpdateInput,
	): Promise<Omit<User, 'password'>> {
		// パスワードが更新される場合はハッシュ化する
		if (data.password) {
			data.password = await bcrypt.hash(data.password as string, 10);
		}

		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data,
		});

		const { password, ...result } = updatedUser;
		return result;
	}

	/**
	 * ユーザーを削除する
	 */
	async remove(userId: number): Promise<Omit<User, 'password'>> {
		// ユーザーが存在するか確認
		await this.findOneById(userId);
		const deletedUser = await this.prisma.user.delete({
			where: { id: userId },
		});
		const { password, ...result } = deletedUser;
		return result;
	}
	// --- 👆 ここまで ---
}
