import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth//guards/jwt-auth.guard';
import { AccountKeyGuard, AccountStudentRequest } from '../auth/guards/account-key.guard';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionPaginationDto } from './dto/transaction.pagination.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, UserAvailableGuard, PermissionsGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post('process-account')
  @Permissions('create:transactions')
  @UseGuards(AccountKeyGuard)
  getStudentFromToken(@Req() req: AccountStudentRequest) {
    const { upbCode } = req.student;
    const { department_id, role_id } = req.user;
    return this.transactionsService.getStudentHeaderInfo(upbCode, department_id, role_id);
  }

  @Post()
  @Permissions('create:transactions')
  @ApiOperation({ summary: 'Create new transaction' })
  create(@Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(createDto);
  }

  @Get()
  @Permissions('view:transactions')
  @ApiOperation({ summary: 'List all transactions with pagination' })
  findAll(@Query() pagination: TransactionPaginationDto) {
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

  @Patch(':id/comment')
  @Permissions('create:comments')
  @ApiOperation({ summary: 'Add a comment to a transaction' })
  addStudentComment(@Param('id') id: string, @Body('comment') comment: string, @Req() req: AuthenticatedRequest) {
    return this.transactionsService.addStudentComment(+id, comment, req.user.upbCode);
  }
}
