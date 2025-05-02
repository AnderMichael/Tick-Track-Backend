// src/components/transactions/transactions.controller.ts
import { Controller, Get, Param, Delete, UseGuards, Query, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth//guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Permissions('create:transactions')
  @ApiOperation({ summary: 'Create new transaction' })
  create(@Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(createDto);
  }

  @Get()
  @Permissions('view:transactions')
  @ApiOperation({ summary: 'List all transactions with pagination' })
  findAll(@Query() pagination: PaginationDto) {
    return this.transactionsService.findAll(pagination);
  }

  @Get(':id')
  @Permissions('view:transactions')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Delete(':id')
  @Permissions('delete:transactions')
  @ApiOperation({ summary: 'Soft delete a transaction by ID' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
