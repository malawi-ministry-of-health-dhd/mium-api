import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  // -----------------------------
  // LOGIN
  // -----------------------------
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string
  ) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      return { error: 'Invalid username or password' };
    }
    return this.authService.login(user);
  }

 
  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('roles') roles: string[] = ['USER'],
    @Body('programs') programs: string[] = []
  ) {
    const existing = await this.usersService.findOne(username);
    if (existing) {
      return { error: 'Username already exists' };
    }

    const user = await this.usersService.createUser(username, password, roles, programs);
    const token = await this.authService.login(user);

    return {
      message: 'User registered successfully',
      user,
      ...token,
    };
  }

  // -----------------------------
  // TEST PROTECTED ROUTE
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
