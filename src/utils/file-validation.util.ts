import { BadRequestException } from '@nestjs/common';
import * as FileType from 'file-type';

interface ValidateFileOptions {
  allowedMimeTypes: string[];
  maxSizeInMB?: number;
}

export async function validateUploadedFile(
  buffer: Buffer,
  options: ValidateFileOptions,
): Promise<void> {
  if (!buffer) {
    throw new BadRequestException('الملف غير موجود');
  }

  const maxSizeInBytes = (options.maxSizeInMB ?? 2) * 1024 * 1024;
  if (buffer.length > maxSizeInBytes) {
    throw new BadRequestException(
      `حجم الملف كبير، الحد الأقصى ${options.maxSizeInMB ?? 2}MB`,
    );
  }

  const fileType = await FileType.fileTypeFromBuffer(buffer);

  if (!fileType || !options.allowedMimeTypes.includes(fileType.mime)) {
    throw new BadRequestException(`نوع الملف غير مسموح به: ${fileType?.mime}`);
  }
}
