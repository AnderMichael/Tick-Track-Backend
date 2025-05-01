import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfirmDto } from './dto/confirm.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserAvailableGuard } from './guards/user-availability.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.obtainToken(loginDto);
    return { token: token };
  }

  @UseGuards(JwtAuthGuard, UserAvailableGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user info with extended details' })
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    return this.authService.getUserDetails(req.user);
  }

  @UseGuards(JwtAuthGuard, UserAvailableGuard)
  @Patch('confirm')
  async confirmUser(@Req() req: AuthenticatedRequest, @Body() body: ConfirmDto) {
    return this.authService.confirmCredentials(req.user.upbCode, body);
  }

  @UseGuards(JwtAuthGuard, UserAvailableGuard)
  @Patch('reset-password/:upbCode')
  async resetPassword(@Req() req: AuthenticatedRequest, @Param('upbCode') upbCode: number) {
    return this.authService.resetCredentials(req.user, upbCode);
  }
}
