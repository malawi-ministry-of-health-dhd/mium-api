import { ApiProperty } from '@nestjs/swagger';

// Response DTO
export class ProgramDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Program A' })
  name: string;
}

// Create / Update Program input
export class CreateProgramDto {
  @ApiProperty({ example: 'Program A' })
  name: string;
}

// Assign programs to a user
export class AssignProgramsDto {
  @ApiProperty({ example: [1, 2], description: 'Array of program IDs' })
  programIds: number[];
}
