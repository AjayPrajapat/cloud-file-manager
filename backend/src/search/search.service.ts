import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(userId: string, query: string) {
    if (!query) {
      return [];
    }
    return this.prisma.file.findMany({
      where: {
        ownerId: userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.split(/\s+/) } },
        ],
      },
      include: { currentVersion: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }
}
