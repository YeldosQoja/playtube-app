ALTER TABLE "videos" RENAME COLUMN "storage_key" TO "key";--> statement-breakpoint
ALTER TABLE "videos" RENAME COLUMN "thumbnail_storage_key" TO "thumbnail_key";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_public_key_unique";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_storage_key_unique";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_thumbnail_storage_key_unique";--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "thumbnail_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN IF EXISTS "public_key";--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_key_unique" UNIQUE("key");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_thumbnail_key_unique" UNIQUE("thumbnail_key");