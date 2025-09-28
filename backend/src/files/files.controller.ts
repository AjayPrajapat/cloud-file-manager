import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import type { Express } from 'express';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  listFiles(@CurrentUser() user: any, @Query('folderId') folderId?: string) {
    return this.filesService.listFiles(user.userId, folderId);
  }

  @Get('shared-with-me')
  listShared(@CurrentUser() user: any) {
    return this.filesService.listSharedWith(user.userId);
  }

  @Get('folders')
  listFolders(@CurrentUser() user: any, @Query('parentId') parentId?: string) {
    return this.filesService.listFolders(user.userId, parentId);
  }

  @Post('folders')
  createFolder(
    @CurrentUser() user: any,
    @Body() payload: { name: string; parentId?: string },
  ) {
    return this.filesService.createFolder(user.userId, payload.name, payload.parentId);
  }

  @Get('folders/:id/breadcrumbs')
  breadcrumbs(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.getBreadcrumbs(user.userId, id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 1024 * 1024 * 200 },
    }),
  )
  uploadFile(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
    @Body('tags') tags?: string,
  ) {
    const parsedTags = tags ? tags.split(',').map((tag) => tag.trim()) : [];
    return this.filesService.uploadFile({ userId: user.userId, file, folderId, tags: parsedTags });
  }

  @Get('audit/logs')
  getAudit(@CurrentUser() user: any) {
    return this.filesService.getAuditLog(user.userId);
  }

  @Get(':id')
  getFile(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.getFile(user.userId, id);
  }

  @Delete(':id')
  deleteFile(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.deleteFile(user.userId, id);
  }

  @Post(':id/share')
  shareFile(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() payload: { sharedWith?: string; permission?: string; expiresAt?: string },
  ) {
    const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : undefined;
    return this.filesService.shareFile(user.userId, id, {
      sharedWith: payload.sharedWith,
      permission: payload.permission,
      expiresAt,
    });
  }

  @Get(':id/versions')
  getVersions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.getVersionHistory(user.userId, id);
  }
}
