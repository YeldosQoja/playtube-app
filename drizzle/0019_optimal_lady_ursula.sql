CREATE TABLE "accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"auth_user" integer NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(50),
	"username" varchar(50) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "accounts_id_unique" UNIQUE("id"),
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(50),
	"username" varchar(50) NOT NULL,
	"password" "bytea" NOT NULL,
	"salt" "bytea" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "auth_users_id_unique" UNIQUE("id"),
	CONSTRAINT "auth_users_email_unique" UNIQUE("email"),
	CONSTRAINT "auth_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_users_id_fk";
--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_author_users_id_fk";
--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_author_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_auth_user_auth_users_id_fk" FOREIGN KEY ("auth_user") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_accounts_id_fk" FOREIGN KEY ("author") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_author_accounts_id_fk" FOREIGN KEY ("author") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_author_accounts_id_fk" FOREIGN KEY ("author") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;