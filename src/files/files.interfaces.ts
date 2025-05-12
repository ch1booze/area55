export class UploadFileDto {
  name: string;
  size: number;
  buffer: Buffer;
  mimetype: string;
}
