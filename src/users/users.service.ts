import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemisUserService } from '../memis/memis.users.service';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../role/roles.service';
import { ProgramsService } from '../programs/programs.service';

interface UserProfileInput {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private memisUserService: MemisUserService,
    private rolesService: RolesService,
    private programsService: ProgramsService,
  ) {}

  // Find user by username
  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        roles: { include: { role: true } },
        programs: { include: { program: true } },
        profile: true,
      },
    });
  }

  // -----------------------
  // Create user with validation
  // -----------------------
  async createUser(
    username: string,
    password: string,
    roleNames: string[],
    programNames?: string[],
    facilityCodes?: string[],
    profile?: UserProfileInput,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    let rolesData: { roleId: number }[] = [];
    let programsData: { programId: number }[] = [];
    let facilitiesData: { facilityId: number }[] = [];

    // Validate and create roles if missing
    if (roleNames && roleNames.length > 0) {
      let roles = await this.prisma.role.findMany({
        where: { name: { in: roleNames } },
      });

      if (roles.length !== roleNames.length) {
        const existingNames = roles.map((r) => r.name);
        const missing = roleNames.filter((r) => !existingNames.includes(r));

        // Create missing roles
        for (const name of missing) {
          await this.rolesService.createRole(name);
        }

        // Fetch all roles again after creation
        roles = await this.prisma.role.findMany({
          where: { name: { in: roleNames } },
        });
      }

      rolesData = roles.map((r) => ({ roleId: r.id }));
    }

    // Validate and create programs if missing
    if (programNames && programNames.length > 0) {
      let programs = await this.prisma.program.findMany({
        where: { name: { in: programNames } },
      });

      if (programs.length !== programNames.length) {
        const existingNames = programs.map((p) => p.name);
        const missing = programNames.filter((p) => !existingNames.includes(p));

        // Create missing programs
        for (const name of missing) {
          await this.programsService.createProgram(name);
        }

        // Fetch all programs again after creation
        programs = await this.prisma.program.findMany({
          where: { name: { in: programNames } },
        });
      }

      programsData = programs.map((p) => ({ programId: p.id }));
    }

    // Validate facilities
    if (facilityCodes && facilityCodes.length > 0) {
      const facilities = await this.prisma.facility.findMany({
        where: { facility_code: { in: facilityCodes } },
      });

      if (facilities.length !== facilityCodes.length) {
        const existingCodes = facilities.map((f) => f.facility_code);
        const missing = facilityCodes.filter((f) => !existingCodes.includes(f));
        throw new NotFoundException(
          `Facilities not found: ${missing.join(', ')}`,
        );
      }

      facilitiesData = facilities.map((f) => ({ facilityId: f.id }));
    }

    if (
      !(await this.memisUserService.createMemisUser({
        password,
        username,
        roleNames,
        facilityCodes,
        profile,
      }))
    )
      return;

    // Create user
    return this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roles: { create: rolesData },
        programs: { create: programsData },
        facilities: { create: facilitiesData },
        profile: profile
          ? {
              create: {
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                gender: profile.gender || '',
                dateOfBirth: profile.dateOfBirth || new Date('1900-01-01'),
              },
            }
          : undefined,
      },
      include: {
        roles: { include: { role: true } },
        programs: { include: { program: true } },
        facilities: { include: { facility: true } },
        profile: true,
      },
    });
  }

  // Get all users
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        roles: { include: { role: true } },
        programs: { include: { program: true } },
        facilities: { include: { facility: true } },
        profile: true,
      },
    });
  }

  // Get user by ID
  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        programs: { include: { program: true } },
        facilities: { include: { facility: true } },
        profile: true,
      },
    });
  }

  // Assign roles to user
  async assignRolesToUser(userId: number, roleNames: string[]) {
    await this.prisma.userRole.deleteMany({ where: { userId } });
    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
    });
    const data = roles.map((r) => ({ userId, roleId: r.id }));
    return this.prisma.userRole.createMany({ data });
  }

  // Assign programs to user
  async assignProgramsToUser(userId: number, programNames: string[]) {
    await this.prisma.userProgram.deleteMany({ where: { userId } });
    const programs = await this.prisma.program.findMany({
      where: { name: { in: programNames } },
    });
    const data = programs.map((p) => ({ userId, programId: p.id }));
    return this.prisma.userProgram.createMany({ data });
  }

  // Delete user
  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // Update user password
  async updateUser(id: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  }

  // Assign facilities to user
  async assignFacilitiesToUser(userId: number, facilityIds: number[]) {
    await this.prisma.userFacility.deleteMany({ where: { userId } });

    const assignments = facilityIds.map((facilityId) => ({
      userId,
      facilityId,
    }));

    await this.prisma.userFacility.createMany({
      data: assignments,
      skipDuplicates: true,
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        facilities: { include: { facility: true } },
        roles: { include: { role: true } },
        programs: { include: { program: true } },
        profile: true,
      },
    });
  }
}
