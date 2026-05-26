ALTER TABLE "videos" RENAME COLUMN "status" TO "processing_status";--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "publication_status" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "publication_status" SET NOT NULL;