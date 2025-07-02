// api/src/posts/posts.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: { user: { userId: number } },
    @Body() createPostDto: Omit<CreatePostDto, 'authorId'>,
  ) {
    const postData = { ...createPostDto, authorId: req.user.userId };
    return await this.postsService.create(postData);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Request() req: { user: { userId: number } }, // 👈 追加
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    // 記事の所有者かどうかのチェックを追加
    const isAuthor = await this.postsService.isAuthor(id, req.user.userId);
    if (!isAuthor) {
      throw new UnauthorizedException('You are not authorized to update this post.');
    }
    return await this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Request() req: { user: { userId: number } }, // 👈 追加
    @Param('id', ParseIntPipe) id: number,
  ) {
    // 記事の所有者かどうかのチェックを追加
    const isAuthor = await this.postsService.isAuthor(id, req.user.userId);
    if (!isAuthor) {
      throw new UnauthorizedException('You are not authorized to delete this post.');
    }
    return await this.postsService.remove(id);
  }
}