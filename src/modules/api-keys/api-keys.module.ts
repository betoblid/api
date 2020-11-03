import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TokensModule } from '../tokens/tokens.module';
import { ApiKeyController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [PrismaModule, TokensModule],
  controllers: [ApiKeyController],
  providers: [ApiKeysService],
})
export class ApiKeysModule {}
