import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import https from 'https';

const prisma = new PrismaClient();

async function main() {
  // Create an HTTPS agent that ignores SSL verification
  const agent = new https.Agent({
    rejectUnauthorized: false, // ⚠️ Only for dev/test
  });

  const response = await axios.get('https://zipatala.health.gov.mw/api/facilities', { httpsAgent: agent });
  const facilities = response.data; // assuming it returns an array

  for (const facility of facilities) {
    const { facility_code, facility_name, facility_code_mapping } = facility;

    await prisma.facility.upsert({
      where: { facility_code },
      update: {
        facility_name,
        facility_code_mapping,
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
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
