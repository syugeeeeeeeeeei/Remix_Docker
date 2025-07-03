import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: 'http://localhost:5173',
		credentials: true,
	});

	await app.listen(3000);

	// Vite HMRに対応するための設定
	if (import.meta.hot) {
		import.meta.hot.accept();
		import.meta.hot.dispose(() => app.close());
	}
}

// Viteで起動するためにエクスポート
export const viteNodeApp = bootstrap();