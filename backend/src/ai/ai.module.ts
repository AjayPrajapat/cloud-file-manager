import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { FilesModule } from '../files/files.module';
import { S3Service } from '../config/s3.service';

@Module({
  imports: [FilesModule],
  providers: [AiService, S3Service],
  controllers: [AiController],
})
export class AiModule {}
