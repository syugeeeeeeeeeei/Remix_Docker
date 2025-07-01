import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private usersService: UsersService) {
		super({
			// リクエストのAuthorizationヘッダーからBearerトークンを読み取る
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			// 有効期限切れのトークンを許可しない
			ignoreExpiration: false,
			// .envファイルから秘密鍵を読み込む
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	/**
	 * トークンの検証が成功した後、ペイロードを元にユーザー情報を返す
	 */
	async validate(payload: { sub: number; email: string }) {
		// payload.subにユーザーIDが格納されている
		// ここで返すオブジェクトは、リクエストオブジェクト（req.user）に格納される
		return { userId: payload.sub, email: payload.email };
	}
}