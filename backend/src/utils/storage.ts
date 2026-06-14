import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from '../config/logger';

let s3Client: S3Client | null = null;

if (config.aws.accessKeyId && config.aws.secretAccessKey) {
  s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });
}

export const uploadToS3 = async (filePath: string, key: string): Promise<string> => {
  if (!s3Client) throw new Error('S3 not configured');
  const fileContent = fs.readFileSync(filePath);
  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    Body: fileContent,
    ACL: 'private',
  });
  await s3Client.send(command);
  return key;
};

export const getS3SignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  if (!s3Client) throw new Error('S3 not configured');
  const command = new GetObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  if (!s3Client) throw new Error('S3 not configured');
  const command = new DeleteObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  });
  await s3Client.send(command);
};

export const deleteLocalFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('Failed to delete local file:', error);
  }
};

export const ensureUploadDir = (): void => {
  const dir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
