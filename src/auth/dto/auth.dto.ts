import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

// Login input
export class LoginDto {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'admin123' })
  password: string;
}

// Register input
export class RegisterDto {
  @ApiProperty({ example: 'john' })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: ['USER'], required: false })
  roles?: string[];

  @ApiProperty({ example: ['Program A'], required: false })
  programs?: string[];
}

// Auth response with JWT token
export class AuthResponseDto {
  @ApiProperty({ example: 'jwt-token-here' })
  access_token: string;

  @ApiProperty({ example: '1d' })
  expires_in: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
