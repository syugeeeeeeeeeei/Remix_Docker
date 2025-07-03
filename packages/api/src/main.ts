import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// 開発時にRemixからのアクセスを許可するためのCORS設定
	app.enableCors({
		origin: 'http://localhost:5173', // 開発用RemixサーバーのURL
		credentials: true,
	});

	await app.listen(3000);
}
bootstrap();