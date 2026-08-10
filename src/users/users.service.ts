import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemisUnavailableError } from '../memis/memis-client.service';
import { MemisUserService } from '../memis/memis.users.service';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../role/roles.service';
import { ProgramsService } from '../programs/programs.service';
import { UpdateUserDto } from './dto/user.dto';

interface UserProfileInput {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: Date;
}

interface UserGroupInput {
  id: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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
    userGroups?: UserGroupInput[],
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

    // MEMIS must accept the user before anything is persisted locally: a MEMIS
    // outage aborts the whole operation rather than leaving the two systems out
    // of sync.
    let memisCreated: boolean;
    try {
      memisCreated = await this.memisUserService.createMemisUser({
        password,
        username,
        roleNames,
        facilityCodes,
        profile,
        userGroups,
      });
    } catch (error) {
      if (error instanceof MemisUnavailableError) {
        throw new ServiceUnavailableException(
          'MEMIS is unavailable — the user was not created. Please try again later.',
        );
      }
      throw error;
    }

    // Previously this returned undefined, which the controller sent as HTTP 201
    // with an empty body — the client then failed parsing the response instead of
    // showing why the user was not created.
    if (!memisCreated) {
      throw new BadGatewayException(
        'MEMIS rejected the user — the user was not created. Check the facility code and roles.',
      );
    }

    // Create user
   const createdUser = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        userGroups: (userGroups ?? []) as unknown as Prisma.InputJsonValue,
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


    return createdUser;
  }

  // Get all users
  async getAllUsers(searchString?: string) {
    const search = searchString?.trim();

    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search } },
              { profile: { firstName: { contains: search } } },
              { profile: { lastName: { contains: search } } },
            ],
          }
        : undefined,
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
 async updateUser(id: number, dto: UpdateUserDto) {
    // Ensure user exists (also fetch username for Memis sync)
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    })
    if (!existing) throw new NotFoundException('User not found')

    // -----------------------
    // Build user update data only for provided props
    // -----------------------
    const data: any = {}

    // 1) Password
    if (typeof dto.password === 'string' && dto.password.length > 0) {
      data.password = await bcrypt.hash(dto.password, 10)
    }

    // 2) Roles (replace if provided)
    if (Array.isArray(dto.roles)) {
      // validate + create missing roles (same logic as createUser)
      let roles = await this.prisma.role.findMany({
        where: { name: { in: dto.roles } },
      })

      if (roles.length !== dto.roles.length) {
        const existingNames = roles.map((r) => r.name)
        const missing = dto.roles.filter((r) => !existingNames.includes(r))

        for (const name of missing) {
          await this.rolesService.createRole(name)
        }

        roles = await this.prisma.role.findMany({
          where: { name: { in: dto.roles } },
        })
      }

      data.roles = {
        deleteMany: {}, // remove current
        create: roles.map((r) => ({ roleId: r.id })),
      }
    }

    // 3) Programs (replace if provided)
    if (Array.isArray(dto.programs)) {
      let programs = await this.prisma.program.findMany({
        where: { name: { in: dto.programs } },
      })

      if (programs.length !== dto.programs.length) {
        const existingNames = programs.map((p) => p.name)
        const missing = dto.programs.filter((p) => !existingNames.includes(p))

        for (const name of missing) {
          await this.programsService.createProgram(name)
        }

        programs = await this.prisma.program.findMany({
          where: { name: { in: dto.programs } },
        })
      }

      data.programs = {
        deleteMany: {},
        create: programs.map((p) => ({ programId: p.id })),
      }
    }

    // 4) Facilities (your DTO for update has facility codes in Create, but Update inherits it too)
    //    If you keep dto.facilities as string[] (codes) then do this:
    if (Array.isArray(dto.facilities)) {
      const facilityCodes = dto.facilities

      const facilities = await this.prisma.facility.findMany({
        where: { facility_code: { in: facilityCodes } },
      })

      if (facilities.length !== facilityCodes.length) {
        const existingCodes = facilities.map((f) => f.facility_code)
        const missing = facilityCodes.filter((c) => !existingCodes.includes(c))
        throw new NotFoundException(`Facilities not found: ${missing.join(', ')}`)
      }

      data.facilities = {
        deleteMany: {},
        create: facilities.map((f) => ({ facilityId: f.id })),
      }
    }

    if (Array.isArray(dto.userGroups)) {
      data.userGroups = dto.userGroups
    }

    // 5) Profile (update only provided fields; create if not exists)
    if (dto.profile) {
      const profileUpdate: any = {}

      if (dto.profile.firstName !== undefined) profileUpdate.firstName = dto.profile.firstName
      if (dto.profile.lastName !== undefined) profileUpdate.lastName = dto.profile.lastName
      if (dto.profile.gender !== undefined) profileUpdate.gender = dto.profile.gender
      if (dto.profile.dateOfBirth !== undefined) profileUpdate.dateOfBirth = dto.profile.dateOfBirth

      // Only attach if at least one field is present
      if (Object.keys(profileUpdate).length > 0) {
        data.profile = existing.profile
          ? { update: profileUpdate }
          : {
              create: {
                // safe defaults if some fields are missing on create
                firstName: profileUpdate.firstName ?? '',
                lastName: profileUpdate.lastName ?? '',
                gender: profileUpdate.gender ?? '',
                dateOfBirth: profileUpdate.dateOfBirth ?? new Date('1900-01-01'),
              },
            }
      }
    }

    // Nothing to update
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No valid fields provided to update')
    }

    // -----------------------
    // Optional: sync to Memis (only send what exists)
    // -----------------------
    // If your memis service supports an update method, use it.
    // If not, adapt to your actual API.

      // MEMIS is synced first and must be reachable: if it is down the local
      // update is abandoned too, so the two systems never diverge.
      try {
        const memisUpdated = await this.memisUserService.updateMemisUser(
          existing.username,
          {
            password: dto.password, // send plain only if changed (some external systems need plain)
            roleNames: Array.isArray(dto.roles) ? dto.roles : undefined,
            facilityCodes: Array.isArray(dto.facilities) ? dto.facilities : undefined,
            userGroups: Array.isArray(dto.userGroups) ? dto.userGroups : undefined,
            profile: dto.profile ? dto.profile : undefined,
          },
        )

        if (!memisUpdated) {
          this.logger.warn(
            `MEMIS did not update "${existing.username}"; applying the local update anyway`,
          )
        }
      } catch (error) {
        if (error instanceof MemisUnavailableError) {
          throw new ServiceUnavailableException(
            'MEMIS is unavailable — the user was not updated. Please try again later.',
          )
        }
        throw error
      }


    // -----------------------
    // Update user in DB and return full object
    // -----------------------
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        roles: { include: { role: true } },
        programs: { include: { program: true } },
        facilities: { include: { facility: true } },
        profile: true,
      },
    })
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

  /**
   * Check if username already exists in the database
   * @param username - The username to validate
   * @returns boolean - true if username exists, false if available
   */
  async usernameExists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    
    return user !== null;
  }
}
