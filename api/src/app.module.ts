import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module'; // posts.module.tsをインポート

@Module({
  imports: [PostsModule], // imports配列にPostsModuleを追加
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
