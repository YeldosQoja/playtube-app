ALTER TABLE "comments" DROP CONSTRAINT "comments_id_unique";--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_id_unique";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_id_unique";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "privacy" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "privacy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "publication_status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "publication_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "publication_status" DROP NOT NULL;