<p align="center">
  <img src="./public/muim_logo.png" width="200" alt="MIUM Logo" />
</p>

<h1 align="center">MIUM API</h1>
<p align="center">MAHIS Integrated User Management — central identity &amp; access layer for the MAHIS ecosystem</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/DB-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
</p>

## Overview

**MIUM** (MAHIS Integrated User Management) is the central identity and access
management API for the MAHIS ecosystem. It provides a single, trusted source of
user data for every connected health information system, handling authentication,
authorization and the assignment of users to roles, programs and facilities.

It also synchronises user data with **MEMIS**, so user groups and identities can
be shared across systems.

### Key features

- **JWT-secured authentication** & session management
- **Role-based access control** (RBAC) via guards and a `@Roles()` decorator
- Assignment of users to **roles**, **programs** and **facilities**
- **MEMIS** user-group synchronisation
- Structured **audit & HTTP request logging** (Winston, with daily-rotated files)
- Interactive **Swagger** API documentation
- A branded landing page served at the root

## Tech stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | [NestJS 11](https://nestjs.com/)              |
| Language         | TypeScript                                    |
| ORM / Database   | [Prisma 6](https://www.prisma.io/) + MySQL    |
| Auth             | Passport (`passport-jwt`, `passport-local`), `@nestjs/jwt`, bcrypt |
| Docs             | `@nestjs/swagger` (Swagger UI)                |
| Logging          | Winston + `nest-winston` + daily rotate file  |

## Project setup

```bash
$ npm install
```

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL="mysql://username:password@localhost:3306/mium"
PORT=4000

# MEMIS integration
MEMIS_BASE_URL="https://host:port/api"
MEMIS_USERNAME=username
MEMIS_PASSWORD=password
MEMIS_TIMEOUT=10000

# Encryption key
KEY=secretkey
```

### Database

```bash
# apply migrations
$ npx prisma migrate deploy

# seed data
$ npm run prisma:seed-admin-user
$ npm run prisma:seed-facilities-online   # or: prisma:seed-facilities-local
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

On startup the app logs its local, network and docs URLs. All routes are served
under the global `/api` prefix.

- Landing page — `http://localhost:<PORT>/api`
- Swagger docs — `http://localhost:<PORT>/api/docs`

## API surface

All endpoints are prefixed with `/api`. Routes marked 🔒 require a JWT bearer
token; those marked 👑 additionally require the `ADMIN` role.

### Auth — `/api/auth`
| Method | Path        | Access | Description                     |
| ------ | ----------- | ------ | ------------------------------- |
| POST   | `/login`    | —      | Authenticate and receive a JWT  |
| POST   | `/register` | —      | Register a new user             |
| POST   | `/profile`  | 🔒     | Get the authenticated profile   |

### Users — `/api/users`
| Method | Path                        | Access | Description                    |
| ------ | --------------------------- | ------ | ------------------------------ |
| GET    | `/`                         | 👑     | List users                    |
| GET    | `/check-username/:username` | —      | Check username availability    |
| GET    | `/:id`                      | 🔒     | Get a user                     |
| POST   | `/register`                 | —      | Register a user                |
| POST   | `/assign-roles/:userId`     | 👑     | Assign roles to a user         |
| POST   | `/assign-programs/:userId`  | 👑     | Assign programs to a user      |
| POST   | `/assign-facilities/:userId`| 👑     | Assign facilities to a user    |
| PUT    | `/:id`                      | 🔒     | Update a user                  |
| DELETE | `/:id`                      | 👑     | Delete a user                  |

### Roles — `/api/roles`
| Method | Path   | Access | Description   |
| ------ | ------ | ------ | ------------- |
| POST   | `/`    | 👑     | Create a role |
| GET    | `/`    | —      | List roles    |
| GET    | `/:id` | 🔒     | Get a role    |
| PUT    | `/:id` | 👑     | Update a role |
| DELETE | `/:id` | 👑     | Delete a role |

### Programs — `/api/programs`
| Method | Path             | Access | Description                  |
| ------ | ---------------- | ------ | ---------------------------- |
| POST   | `/`              | 👑     | Create a program             |
| GET    | `/`              | —      | List programs                |
| GET    | `/:id`           | —      | Get a program                |
| PUT    | `/:id`           | 👑     | Update a program             |
| DELETE | `/:id`           | 👑     | Delete a program             |
| POST   | `/assign/:userId`| 👑     | Assign a program to a user   |
| GET    | `/user/:userId`  | —      | List a user's programs       |

### Facilities — `/api/facilities`
| Method | Path   | Access | Description       |
| ------ | ------ | ------ | ----------------- |
| POST   | `/`    | 👑     | Create a facility |
| GET    | `/`    | 🔒     | List facilities   |
| GET    | `/:id` | 🔒     | Get a facility    |
| PUT    | `/:id` | 👑     | Update a facility |
| DELETE | `/:id` | 👑     | Delete a facility |

### MEMIS — `/api/memis`
| Method | Path                   | Access | Description                     |
| ------ | ---------------------- | ------ | ------------------------------- |
| GET    | `/user-groups`         | 👑     | Fetch MEMIS user groups         |
| GET    | `/user-groups/user-ids`| 👑     | Fetch user IDs for user groups  |

## Data model

Prisma schema (`prisma/schema.prisma`) defines: `User`, `UserProfile`, `Role`,
`Program`, `Facility`, and the join tables `UserRole`, `UserProgram` and
`UserFacility`.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

UNLICENSED — © LUKE International · MAHIS
