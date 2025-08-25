import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { UserDto } from 'src/users/dto/user.dto';

@ApiTags('Auth')
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
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'JWT token returned', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      return { error: 'Invalid username or password' };
    }
    return this.authService.login(user);
  }

  // -----------------------------
  // REGISTER
  // -----------------------------
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Username already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const existing = await this.usersService.findOne(registerDto.username);
    if (existing) {
      return { error: 'Username already exists' };
    }

    const user = await this.usersService.createUser(
      registerDto.username,
      registerDto.password,
      registerDto.roles,
      registerDto.programs
    );

    const token = await this.authService.login(user);

    return {
      message: 'User registered successfully',
      user,
      ...token,
    };
  }

  // -----------------------------
  // PROFILE (Protected)
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserDto })
  getProfile(@Request() req) {
    return req.user;
  }
}
