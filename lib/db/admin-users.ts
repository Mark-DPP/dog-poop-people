import "server-only";

import { neon } from "@neondatabase/serverless";
import type { User } from "@clerk/nextjs/server";

const databaseUrl = process.env.DATABASE_URL;

const sql = databaseUrl ? neon(databaseUrl) : null;

function getPrimaryEmail(user: User) {
  const primaryEmailId = user.primaryEmailAddressId;
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === primaryEmailId,
  );

  return primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

function getFullName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
}

export async function upsertAdminUser(user: User) {
  if (!sql) {
    throw new Error("DATABASE_URL is required to store admin users.");
  }

  const email = getPrimaryEmail(user);
  const fullName = getFullName(user);

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL UNIQUE,
      email TEXT,
      full_name TEXT,
      image_url TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      last_signed_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO admin_users (
      clerk_user_id,
      email,
      full_name,
      image_url,
      role,
      last_signed_in_at,
      updated_at
    )
    VALUES (
      ${user.id},
      ${email},
      ${fullName},
      ${user.imageUrl},
      'admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      image_url = EXCLUDED.image_url,
      role = EXCLUDED.role,
      last_signed_in_at = NOW(),
      updated_at = NOW()
  `;
}
