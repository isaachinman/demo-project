CREATE TYPE "public"."memory_category" AS ENUM('background', 'people', 'work', 'interests', 'plans', 'preferences', 'feelings');--> statement-breakpoint
CREATE TYPE "public"."turn_role" AS ENUM('user', 'agent');--> statement-breakpoint
CREATE TABLE "conversations" (
	"duration_secs" integer NOT NULL,
	"extracted_at" timestamp with time zone,
	"id" text PRIMARY KEY NOT NULL,
	"opener" text,
	"started_at" timestamp with time zone NOT NULL,
	"summary" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"resolved_at" timestamp with time zone,
	"source_conversation_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"why" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"category" "memory_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fact" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_conversation_id" text NOT NULL,
	"superseded_at" timestamp with time zone,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "turns" (
	"conversation_id" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"index" integer NOT NULL,
	"llm_ttfb_ms" integer,
	"llm_ttf_sentence_ms" integer,
	"message" text NOT NULL,
	"role" "turn_role" NOT NULL,
	"time_in_call_secs" integer NOT NULL,
	CONSTRAINT "turns_conversationId_index_unique" UNIQUE("conversation_id","index")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"next_opener" text,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_source_conversation_id_conversations_id_fk" FOREIGN KEY ("source_conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_source_conversation_id_conversations_id_fk" FOREIGN KEY ("source_conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turns" ADD CONSTRAINT "turns_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_user_id_started_at_index" ON "conversations" USING btree ("user_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "memories_user_id_index" ON "memories" USING btree ("user_id") WHERE "memories"."superseded_at" is null;