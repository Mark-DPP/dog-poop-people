import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function verifyDatabaseConnection() {
  const [result] = await prisma.$queryRaw<Array<{ ok: number }>>`
    SELECT 1 AS ok
  `;

  return result?.ok === 1;
}

