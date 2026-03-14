import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '@/common/decorators/require-permission.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { HandleReviewDto } from './dto/handle-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @RequirePermission('reviews.view')
  findAll(
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('rating') rating?: string,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.findAll({ status, channel, rating, search });
  }

  @Post()
  @RequirePermission('reviews.create')
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Patch(':id/handle')
  @RequirePermission('reviews.handle')
  handle(@Param('id') id: string, @Body() dto: HandleReviewDto) {
    return this.reviewsService.handle(id, dto);
  }

  @Post(':id/reply')
  @RequirePermission('reviews.reply')
  reply(@Param('id') id: string, @Body() dto: ReplyReviewDto) {
    return this.reviewsService.reply(id, dto);
  }
}
