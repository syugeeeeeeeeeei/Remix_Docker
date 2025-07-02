// api/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'; // UnauthorizedException をインポート
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private usersService: UsersService) {
		// JWT_SECRET が設定されていることを確認
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			// 環境変数が設定されていない場合はエラーをスローしてアプリケーションの起動を停止
			throw new Error('JWT_SECRET is not defined in environment variables.');
		}

		super({
			// リクエストのAuthorizationヘッダーからBearerトークンを読み取る
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			// 有効期限切れのトークンを許可しない
			ignoreExpiration: false,
			// .envファイルから秘密鍵を読み込む
			secretOrKey: jwtSecret, // 👈 undefined の可能性を排除
		});
	}

	/**
	 * トークンの検証が成功した後、ペイロードを元にユーザー情報を返す
	 */
	async validate(payload: { sub: number; email: string }) {
		// payload.subにユーザーIDが格納されている
		// ここで返すオブジェクトは、リクエストオブジェクト（req.user）に格納される
		// ユーザーが存在しない場合を考慮して、見つからない場合は UnauthorizedException をスローする
		const user = await this.usersService.findOneByEmail(payload.email);
		if (!user) {
			throw new UnauthorizedException('User not found.');
		}
		return { userId: payload.sub, email: payload.email };
	}
}