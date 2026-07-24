import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('catalog/preview')
  getCatalogPreview() {
    return this.appService.getCatalogPreview();
  }

  @Get('openings')
  getOpenings() {
    return this.appService.getOpenings();
  }

  @Get('openings/:id')
  getOpening(@Param('id') id: string) {
    return this.appService.getOpening(id);
  }

  @Get('traps')
  getTraps() {
    return this.appService.getTraps();
  }

  @Get('traps/:id')
  getTrap(@Param('id') id: string) {
    return this.appService.getTrap(id);
  }

  @Get('traps/:id/training')
  getTrapTraining(@Param('id') id: string) {
    return this.appService.getTrapTraining(id);
  }

  @Get('traps/:id/lesson')
  getTrapLesson(@Param('id') id: string) {
    return this.appService.getTrapLesson(id);
  }

  @Get('traps/:id/watch')
  getTrapWatch(@Param('id') id: string) {
    return this.appService.getTrapWatch(id);
  }

  @Get('traps/:id/tour')
  getTrapTour(@Param('id') id: string) {
    return this.appService.getTrapTour(id);
  }

  @Get('traps/:id/practice')
  getTrapPractice(@Param('id') id: string) {
    return this.appService.getTrapPractice(id);
  }

  @Post('traps/:id/:mode/validate')
  validateTrapMove(
    @Param('id') id: string,
    @Param('mode') mode: 'tour' | 'practice',
    @Body() body: { turnId: string; move: string }
  ) {
    return this.appService.validateTrapMove(id, mode, body.turnId, body.move);
  }

  @Get('review/today')
  getTodayReview() {
    return this.appService.getTodayReview();
  }
}