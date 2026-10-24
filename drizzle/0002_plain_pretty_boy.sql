CREATE TABLE "account_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "album_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"title" text NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "album_tracks_album_position_unique" UNIQUE("album_id","position")
);
--> statement-breakpoint
CREATE TABLE "artist_follows" (
	"user_id" uuid NOT NULL,
	"artist_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artist_follows_user_id_artist_name_pk" PRIMARY KEY("user_id","artist_name")
);
--> statement-breakpoint
CREATE TABLE "artist_ratings" (
	"user_id" uuid NOT NULL,
	"artist_name" text NOT NULL,
	"score" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artist_ratings_user_id_artist_name_pk" PRIMARY KEY("user_id","artist_name"),
	CONSTRAINT "valid_artist_rating_score" CHECK ("artist_ratings"."score" >= 1 AND "artist_ratings"."score" <= 10)
);
--> statement-breakpoint
CREATE TABLE "user_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"album_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"notes" text,
	"cover_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "release_date" text;--> statement-breakpoint
ALTER TABLE "account_tokens" ADD CONSTRAINT "account_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_tracks" ADD CONSTRAINT "album_tracks_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_follows" ADD CONSTRAINT "artist_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_ratings" ADD CONSTRAINT "artist_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_list_id_user_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."user_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_album_tracks_album_id" ON "album_tracks" USING btree ("album_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "user_list_items_list_pos_idx" ON "user_list_items" USING btree ("list_id","position");--> statement-breakpoint
CREATE INDEX "idx_user_list_items_list_id" ON "user_list_items" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "idx_user_list_items_album_id" ON "user_list_items" USING btree ("album_id");--> statement-breakpoint
CREATE INDEX "idx_user_lists_user_id" ON "user_lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_lists_created_at" ON "user_lists" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_lists_public_created_at" ON "user_lists" USING btree ("is_public","created_at");