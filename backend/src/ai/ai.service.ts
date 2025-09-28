import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesService } from '../files/files.service';
import { S3Service } from '../config/s3.service';
import { OpenAI } from 'openai';

@Injectable()
export class AiService {
  private readonly openai?: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly filesService: FilesService,
    private readonly s3Service: S3Service,
  ) {
    const apiKey = this.config.get<string>('openai.apiKey');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async summarizeFile(userId: string, fileId: string) {
    if (!this.openai) {
      throw new InternalServerErrorException('OpenAI API key not configured');
    }

    const file = await this.filesService.getFile(userId, fileId);
    if (!file || !file.currentVersion) {
      throw new NotFoundException('File not found');
    }

    if (!file.mimeType.startsWith('text/')) {
      return {
        summary: 'AI summarization is currently limited to text-based files.',
      };
    }

    const s3 = this.s3Service.getClient();
    const object = await s3
      .getObject({ Bucket: this.s3Service.getBucket(), Key: file.currentVersion.s3Key })
      .promise();

    const text = object.Body?.toString('utf-8');
    if (!text) {
      throw new InternalServerErrorException('Unable to read file contents');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that summarizes user documents into concise bullet points.',
        },
        {
          role: 'user',
          content: `Provide a short summary of the following document:\n\n${text.substring(0, 6000)}`,
        },
      ],
    });

    return { summary: completion.choices[0].message?.content };
  }
}
