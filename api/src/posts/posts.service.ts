import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // 全記事取得
  async findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      include: { author: true }, // 著者情報も一緒に取得
    });
  }

  // IDを指定して記事を1件取得
  async findOne(id: number): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  // 記事を作成
  // TODO: 認証機能実装後、authorIdをリクエストから取得するように変更
  async create(data: {
    title: string;
    content?: string;
    authorId: number; // 現時点では仮でIDを直接受け取る
  }): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  // 記事を更新
  async update(
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Post> {
    // 記事が存在するか確認
    await this.findOne(id);
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  // 記事を削除
  async remove(id: number): Promise<Post> {
    // 記事が存在するか確認
    await this.findOne(id);
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
