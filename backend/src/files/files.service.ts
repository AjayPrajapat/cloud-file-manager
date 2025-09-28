import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { S3Service } from '../config/s3.service';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3 } from 'aws-sdk';
import { randomBytes } from 'crypto';
import type { Express } from 'express';

@Injectable()
export class FilesService {
  private readonly s3: S3;
  private readonly bucket: string;

  constructor(private prisma: PrismaService, private s3Service: S3Service) {
    this.s3 = this.s3Service.getClient();
    this.bucket = this.s3Service.getBucket();
  }

  async listFiles(userId: string, folderId?: string) {
    return this.prisma.file.findMany({
      where: {
        ownerId: userId,
        folderId: folderId ?? null,
      },
      include: {
        currentVersion: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        sharedLinks: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listFolders(userId: string, parentId?: string) {
    return this.prisma.fileFolder.findMany({
      where: {
        ownerId: userId,
        parentId: parentId ?? null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createFolder(userId: string, name: string, parentId?: string) {
    const folder = await this.prisma.fileFolder.create({
      data: {
        name,
        owner: { connect: { id: userId } },
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        user: { connect: { id: userId } },
        action: 'FOLDER_CREATED',
        metadata: { folderId: folder.id, name },
      },
    });

    return folder;
  }

  async getBreadcrumbs(userId: string, folderId: string) {
    const breadcrumbs: { id: string; name: string }[] = [];
    let currentId: string | undefined = folderId;
    while (currentId) {
      const folder = await this.prisma.fileFolder.findFirst({
        where: { id: currentId, ownerId: userId },
        select: { id: true, name: true, parentId: true },
      });
      if (!folder) {
        break;
      }
      breadcrumbs.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId ?? undefined;
    }
    return breadcrumbs;
  }

  async listSharedWith(userId: string) {
    return this.prisma.shareLink.findMany({
      where: { sharedWith: await this.getUserEmail(userId) },
      include: {
        file: { include: { currentVersion: true } },
      },
    });
  }

  private async getUserEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.email;
  }

  async getFile(userId: string, id: string) {
    const file = await this.prisma.file.findFirst({
      where: { id, ownerId: userId },
      include: { currentVersion: true, versions: true },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!file.currentVersion) {
      throw new NotFoundException('File is missing content');
    }

    const signedUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: file.currentVersion.s3Key,
      Expires: 300,
    });

    return { ...file, signedUrl };
  }

  async uploadFile(params: {
    userId: string;
    file: Express.Multer.File;
    folderId?: string;
    tags?: string[];
  }) {
    const { userId, file, folderId, tags = [] } = params;
    const folderPath = await this.buildFolderPath(userId, folderId);
    const key = `${userId}/${folderPath}${Date.now()}-${file.originalname}`;

    const uploadResult = await this.putObject({
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const existingFile = await this.prisma.file.findFirst({
      where: {
        ownerId: userId,
        name: file.originalname,
        folderId: folderId ?? null,
      },
      include: { currentVersion: true, versions: true },
    });

    let versionNumber = 1;
    if (existingFile) {
      versionNumber = (existingFile.currentVersion?.versionNumber || 0) + 1;
    }

    const version = await this.prisma.fileVersion.create({
      data: {
        file: existingFile
          ? { connect: { id: existingFile.id } }
          : { create: {
              name: file.originalname,
              path: `${folderPath}${file.originalname}`,
              size: file.size,
              mimeType: file.mimetype,
              tags,
              owner: { connect: { id: userId } },
              folder: folderId ? { connect: { id: folderId } } : undefined,
            } },
        versionNumber,
        s3Key: key,
        size: file.size,
        createdBy: { connect: { id: userId } },
      },
      include: { file: true },
    });

    const fileRecord = existingFile
      ? await this.prisma.file.update({
          where: { id: existingFile.id },
          data: {
            size: file.size,
            mimeType: file.mimetype,
            currentVersion: { connect: { id: version.id } },
            tags: tags.length ? tags : undefined,
            versions: { connect: { id: version.id } },
          },
          include: { currentVersion: true, versions: true },
        })
      : await this.prisma.file.update({
          where: { id: version.fileId },
          data: {
            currentVersion: { connect: { id: version.id } },
          },
          include: { currentVersion: true, versions: true },
        });

    await this.prisma.auditLog.create({
      data: {
        user: { connect: { id: userId } },
        file: { connect: { id: fileRecord.id } },
        action: existingFile ? 'FILE_VERSION_UPLOADED' : 'FILE_CREATED',
        metadata: {
          fileName: fileRecord.name,
          size: fileRecord.size,
          version: version.versionNumber,
          uploadResult,
        },
      },
    });

    return fileRecord;
  }

  private async buildFolderPath(userId: string, folderId?: string) {
    if (!folderId) {
      return '';
    }
    const segments: string[] = [];
    let currentId: string | undefined = folderId;
    while (currentId) {
      const folder = await this.prisma.fileFolder.findFirst({
        where: { id: currentId, ownerId: userId },
        select: { name: true, parentId: true },
      });
      if (!folder) {
        break;
      }
      segments.unshift(folder.name + '/');
      currentId = folder.parentId ?? undefined;
    }
    return segments.join('');
  }

  private async putObject(options: { Key: string; Body: Buffer; ContentType: string }) {
    const params: S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: options.Key,
      Body: options.Body,
      ContentType: options.ContentType,
    };
    const result: ManagedUpload.SendData = await this.s3.upload(params).promise();
    return { location: result.Location, eTag: result.ETag };
  }

  async deleteFile(userId: string, id: string) {
    const file = await this.prisma.file.findFirst({
      where: { id, ownerId: userId },
      include: { versions: true },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    for (const version of file.versions) {
      await this.s3
        .deleteObject({ Bucket: this.bucket, Key: version.s3Key })
        .promise();
    }

    await this.prisma.file.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        user: { connect: { id: userId } },
        action: 'FILE_DELETED',
        metadata: { fileName: file.name },
      },
    });

    return { success: true };
  }

  async shareFile(userId: string, fileId: string, payload: { sharedWith?: string; permission?: string; expiresAt?: Date }) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const token = randomBytes(24).toString('hex');
    const share = await this.prisma.shareLink.create({
      data: {
        file: { connect: { id: fileId } },
        createdBy: { connect: { id: userId } },
        sharedWith: payload.sharedWith,
        permission: (payload.permission as any) || 'READ',
        token,
        expiresAt: payload.expiresAt,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        user: { connect: { id: userId } },
        file: { connect: { id: fileId } },
        action: 'FILE_SHARED',
        metadata: { shareId: share.id, sharedWith: payload.sharedWith },
      },
    });

    return share;
  }

  async getVersionHistory(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, include: { createdBy: true } } },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file.versions;
  }

  async getAuditLog(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
