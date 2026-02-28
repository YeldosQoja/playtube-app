-- Custom SQL migration file, put you code below! --
CREATE TYPE privacy AS ENUM ('public', 'private', 'unlisted');
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "privacy" privacy NOT NULL;

