import { ApiProperty } from '@nestjs/swagger';

// Response DTO
export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: ['ADMIN'] })
  roles: string[];

  @ApiProperty({ example: ['Program A'] })
  programs: string[];
}

// Input DTOs
export class CreateUserDto {
  @ApiProperty({ example: 'john' })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: ['USER'], required: false })
  roles?: string[];

  @ApiProperty({ example: ['Program A'], required: false })
  programs?: string[];
}

export class AssignRolesDto {
  @ApiProperty({ example: ['ADMIN', 'USER'] })
  roles: string[];
}

export class AssignProgramsDto {
  @ApiProperty({ example: ['Program A'] })
  programs: string[];
}

export class UpdateUserDto {
  @ApiProperty({ example: 'newpassword123' })
  password: string;
}
