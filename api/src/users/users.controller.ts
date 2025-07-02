// api/src/users/users.controller.ts
import {
	Body,
	Controller,
	Delete,
	Get, // Delete を追加
	HttpCode, // HttpCode を追加
	HttpStatus,
	Patch,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto'; // UpdateUserDto をインポート
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard) // このコントローラー全体に JWT 認証ガードを適用
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	/**
	 * 認証済みユーザーの情報を取得する
	 * GET /users/me
	 */
	@Get('me')
	async getMe(@Request() req: { user: { userId: number } }) {
		return this.usersService.findOneById(req.user.userId);
	}

	/**
	 * 認証済みユーザーの情報を更新する
	 * PATCH /users/me
	 */
	@Patch('me')
	async updateMe(
		@Request() req: { user: { userId: number } },
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.usersService.update(req.user.userId, updateUserDto);
	}

	/**
	 * 認証済みユーザーのアカウントを削除する
	 * DELETE /users/me
	 */
	@Delete('me')
	@HttpCode(HttpStatus.NO_CONTENT) // 成功時に 204 No Content を返す
	async deleteMe(@Request() req: { user: { userId: number } }) {
		await this.usersService.remove(req.user.userId);
		// 削除成功後はコンテンツがないことを示すため、何も返さない
	}
}
  