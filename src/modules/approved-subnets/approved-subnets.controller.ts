import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { approvedLocations } from '@prisma/client';
import { Expose } from 'src/modules/prisma/prisma.interface';
import { CursorPipe } from 'src/pipes/cursor.pipe';
import { OptionalIntPipe } from 'src/pipes/optional-int.pipe';
import { OrderByPipe } from 'src/pipes/order-by.pipe';
import { WherePipe } from 'src/pipes/where.pipe';
import { Scopes } from '../auth/scope.decorator';
import { ApprovedSubnetsService } from './approved-subnets.service';

@Controller('users/:userId/approved-subnets')
export class ApprovedSubnetController {
  constructor(private approvedSubnetsService: ApprovedSubnetsService) {}

  @Get()
  @Scopes('user-{userId}:read-approved-location')
  async getAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('skip', OptionalIntPipe) skip?: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: Record<string, number | string>,
    @Query('where', WherePipe) where?: Record<string, number | string>,
    @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<Expose<approvedLocations>[]> {
    return this.approvedSubnetsService.getApprovedSubnets(userId, {
      skip,
      take,
      orderBy,
      cursor,
      where,
    });
  }

  @Get(':id')
  @Scopes('user-{userId}:read-approved-location-{id}')
  async get(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expose<approvedLocations>> {
    return this.approvedSubnetsService.getApprovedSubnet(userId, Number(id));
  }

  @Delete(':id')
  @Scopes('user-{userId}:delete-approved-location-{id}')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Expose<approvedLocations>> {
    return this.approvedSubnetsService.deleteApprovedSubnet(userId, Number(id));
  }
}
