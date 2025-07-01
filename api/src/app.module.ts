import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module'; // 👈 追加
import { UsersModule } from './users/users.module'; // 👈 追加

@Module({
  imports: [PostsModule, AuthModule, UsersModule], // 👈 追加
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }