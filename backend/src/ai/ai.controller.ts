import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post(':id/ai-summarize')
  summarize(@CurrentUser() user: any, @Param('id') id: string) {
    return this.aiService.summarizeFile(user.userId, id);
  }
}
