import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put, // 👈 追加
  Request,
  UseGuards, // 👈 追加
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 👈 追加
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOne(id);
  }

  // --- 👇 ここから修正 ---
  @UseGuards(JwtAuthGuard) // 👈 このルートを保護
  @Post()
  async create(
    @Request() req: { user: { userId: number } }, // 👈 リクエストからユーザー情報を取得
    @Body() createPostDto: Omit<CreatePostDto, 'authorId'>,
  ) {
    // 認証されたユーザーのIDをauthorIdとして渡す
    const postData = { ...createPostDto, authorId: req.user.userId };
    return await this.postsService.create(postData);
  }

  @UseGuards(JwtAuthGuard) // 👈 このルートを保護
  @Put(':id')
  async update(
    // TODO: 記事の所有者かどうかのチェックを追加する
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard) // 👈 このルートを保護
  @Delete(':id')
  async remove(
    // TODO: 記事の所有者かどうかのチェックを追加する
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.postsService.remove(id);
  }
  // --- 👆 ここまで ---
}