import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

// -------------------------------------------
// Response DTOs
// -------------------------------------------
export class UserProfileDto {
  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'Male' })
  gender: string;

  @ApiProperty({ example: '1990-01-01T00:00:00.000Z' })
  dateOfBirth: Date;
}

export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: ['ADMIN'] })
  roles: string[];

  @ApiProperty({ example: ['Program A'] })
  programs: string[];

  @ApiProperty({ type: UserProfileDto, required: false })
  profile?: UserProfileDto; // Include profile in user response
}

// For input (optional fields during create/update)
export class UserProfileInputDto {
  @ApiProperty({ required: false, example: 'John' })
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  lastName?: string;

  @ApiProperty({ required: false, example: 'Male' })
  gender?: string;

  @ApiProperty({ required: false, example: '1990-01-01T00:00:00.000Z' })
  dateOfBirth?: Date;
}

// -------------------------------------------
// Input DTOs
// -------------------------------------------
export class CreateUserDto {
  @ApiProperty({ example: 'john' })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: ['USER'], required: false })
  roles: string[];

  @ApiProperty({ example: ['Program A'], required: false })
  programs?: string[];

  @ApiProperty({ example: ['LL00012'], required: false })
  facilities?: string[];

  @ApiProperty({ required: false, type: UserProfileInputDto })
  profile?: UserProfileInputDto;
}


export class AssignRolesDto {
  @ApiProperty({ example: ['ADMIN', 'USER'] })
  roles: string[];
}

export class AssignProgramsDto {
  @ApiProperty({ example: ['Program A'] })
  programs: string[];
}

/**
 * UpdateUserDto:
 * - allows updating everything that CreateUserDto accepts
 * - EXCEPT username
 * - makes all fields optional (PATCH semantics)
 */
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['username'] as const)) {}

export class AssignFacilitiesDto {
  @ApiProperty({
    type: [Number],
    description: 'Array of Facility IDs to assign',
  })
  facilities: number[];
}
