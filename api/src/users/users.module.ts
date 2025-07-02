// api/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller'; // 👈 追加
import { UsersService } from './users.service';

@Module({
	imports: [PrismaModule],
	providers: [UsersService],
	exports: [UsersService],
	controllers: [UsersController], // 👈 追加
})
export class UsersModule { }
