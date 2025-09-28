import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly client: S3;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('s3.bucket', '');
    this.client = new S3({
      region: this.config.get<string>('s3.region'),
      endpoint: this.config.get<string>('s3.endpoint'),
      accessKeyId: this.config.get<string>('s3.accessKeyId'),
      secretAccessKey: this.config.get<string>('s3.secretAccessKey'),
      s3ForcePathStyle: this.config.get<boolean>('s3.forcePathStyle'),
      signatureVersion: 'v4',
    });
  }

  getClient() {
    return this.client;
  }

  getBucket() {
    return this.bucket;
  }
}
