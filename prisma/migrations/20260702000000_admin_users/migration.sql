-- The Neon database already contains this table from the Clerk admin auth setup.
-- Keep this migration idempotent so existing data is preserved while Prisma's
-- migration history matches the schema.
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" BIGSERIAL NOT NULL,
  "clerk_user_id" TEXT NOT NULL,
  "email" TEXT,
  "full_name" TEXT,
  "image_url" TEXT,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "last_signed_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_clerk_user_id_key"
  ON "admin_users"("clerk_user_id");
