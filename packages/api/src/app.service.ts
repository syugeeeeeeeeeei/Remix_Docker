import { PrismaClient } from '@my-app/database';
import { Injectable } from '@nestjs/common';

// PrismaClientのインスタンスを生成
const prisma = new PrismaClient();

@Injectable()
export class AppService {
	getHello(): string {
		// ここでprismaを使った処理なども書ける
		return 'Hello from NestJS API!';
	}
}