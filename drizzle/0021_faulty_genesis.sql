CREATE SEQUENCE "public"."account_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."comment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."playlist_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."video_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_id_unique";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "is_for_kids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "is_age_restricted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "allow_comments" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "allow_downloads" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "privacy" SET DEFAULT 'private';--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "privacy" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "birth_date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "publication_status" varchar(24) DEFAULT 'draft' NOT NULL;