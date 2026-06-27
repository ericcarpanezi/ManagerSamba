import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @Get('me')
  me(@Headers('x-user') username?: string) {
    if (!username) {
      throw new UnauthorizedException(
        'Header x-user é obrigatório neste bootstrap',
      );
    }

    return this.authService.me(username);
  }
}
