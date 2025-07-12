import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class AwsService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });
  async uploadFileS3(buffer: Buffer, key: string, mimetype: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));

      const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        url,
        key,
      };
    } catch (error) {
      console.error('Error in uploading image to s3', error);
      throw new InternalServerErrorException('فشل رفع الملف إلى S3');
    }
  }
  async deleteFileS3(key: string) {
    const params = {
      Key: key,
      Bucket: process.env.AWS_S3_BUCKET!,
    };
    try {
      await this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error in deleteing file from S3', error);
      throw new InternalServerErrorException('Error in deleteing file from S3');
    }
  }
}
