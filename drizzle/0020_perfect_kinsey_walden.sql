ALTER TABLE "accounts" DROP CONSTRAINT "accounts_auth_user_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "auth_user" SET DATA TYPE uuid USING "auth_user"::text::uuid;
