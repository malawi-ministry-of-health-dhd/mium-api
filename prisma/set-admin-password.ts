import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';
import { Writable } from 'stream';
import {
  PROTECTED_USERNAME,
  isProtectedAccount,
} from '../src/common/protected-accounts';

const prisma = new PrismaClient();

const ADMIN_ROLE = 'ADMIN';
const MIN_PASSWORD_LENGTH = 8;
// Matches the cost used by createUser() and the auth service's bcrypt.compare.
const BCRYPT_ROUNDS = 10;

/**
 * Reads a line from the terminal. When hidden, the typed characters are not
 * echoed — the password never lands in the terminal scrollback.
 */
function prompt(question: string, hidden = false): Promise<string> {
  let muted = false;

  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding as BufferEncoding);
      callback();
    },
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output,
    terminal: true,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
    muted = hidden;
  });
}

async function main() {
  const username = process.argv[2]?.trim() || PROTECTED_USERNAME;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    console.error(`❌ No MIUM user named "${username}".`);
    console.error('   Pass a username as the first argument, e.g. ts-node prisma/set-admin-password.ts admin');
    process.exitCode = 1;
    return;
  }

  console.log(`Setting a new password for MIUM user "${username}".`);

  const password = await prompt('New password: ', true);
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`❌ Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exitCode = 1;
    return;
  }

  const confirmation = await prompt('Confirm password: ', true);
  if (password !== confirmation) {
    console.error('❌ Passwords do not match. Nothing was changed.');
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(password, BCRYPT_ROUNDS) },
  });

  console.log(`\n✅ Password updated for "${username}".`);

  // MaHIS-Core needs the service account to hold ADMIN, because GET /users and
  // GET /memis/user-groups are ADMIN-gated. Restore the role if it has been
  // cleared. Deliberately limited to the service account — this must not become
  // a way to grant ADMIN to an arbitrary user.
  const alreadyAdmin = user.roles.some((r) => r.role.name === ADMIN_ROLE);

  if (isProtectedAccount(username)) {
    if (alreadyAdmin) {
      console.log(`   ${ADMIN_ROLE} role already present.`);
    } else {
      const adminRole = await prisma.role.upsert({
        where: { name: ADMIN_ROLE },
        update: {},
        create: { name: ADMIN_ROLE },
      });
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
        update: {},
        create: { userId: user.id, roleId: adminRole.id },
      });
      console.log(`   ${ADMIN_ROLE} role was missing — restored.`);
    }
  } else if (!alreadyAdmin) {
    console.warn(
      `\n⚠️  "${username}" does not have the ${ADMIN_ROLE} role, so MaHIS-Core cannot use it\n` +
        '    for Integrated User Management. Left unchanged — granting ADMIN is not this\n' +
        "    command's job.",
    );
  }

  console.log('\nNext step — update MaHIS-Core config/application.yml so it matches:\n');
  console.log('  mium:');
  console.log('    url: <unchanged>');
  console.log(`    username: ${username}`);
  console.log('    password: <the password you just typed>');
  console.log('\nThen restart MaHIS-Core. Until it matches, POST /api/v1/mium/token will fail.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
