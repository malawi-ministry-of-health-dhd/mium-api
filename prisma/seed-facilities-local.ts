import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'seed-data', 'facilities.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const facilities = JSON.parse(rawData);

  for (const facility of facilities) {
    const {
      facility_code,
      facility_name,
      facility_code_mapping,
    } = facility;

    // Upsert facility
    await prisma.facility.upsert({
      where: { facility_code },
      update: {
        facility_name,
        facility_code_mapping, // store the array as JSON
      },
      create: {
        facility_code,
        facility_name,
        facility_code_mapping,
      },
    });

    console.log(`Upserted facility: ${facility_code} - ${facility_name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
