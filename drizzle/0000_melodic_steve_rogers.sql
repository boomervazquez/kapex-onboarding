CREATE TYPE "public"."customer_type" AS ENUM('importer', 'exporter', 'both', 'custom');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('pending', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('pending', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "form_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" integer NOT NULL,
	"formType" varchar(64) NOT NULL,
	"formTitle" varchar(255) NOT NULL,
	"routingDepartment" varchar(255),
	"routingEmail" varchar(320),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"status" "form_status" DEFAULT 'pending' NOT NULL,
	"fieldData" jsonb,
	"signatureName" varchar(255),
	"signatureTitle" varchar(255),
	"signedAt" timestamp,
	"submittedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" integer NOT NULL,
	"token" varchar(128) NOT NULL,
	"customerEmail" varchar(320) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"accessCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "onboarding_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"salespersonId" integer NOT NULL,
	"salespersonName" varchar(255),
	"salespersonEmail" varchar(320),
	"customerName" varchar(255) NOT NULL,
	"customerEmail" varchar(320) NOT NULL,
	"customerCompany" varchar(255),
	"customerType" "customer_type" NOT NULL,
	"status" "session_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "uploaded_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" integer NOT NULL,
	"formAssignmentId" integer,
	"uploadedByEmail" varchar(320),
	"fileName" varchar(255) NOT NULL,
	"fileKey" varchar(512) NOT NULL,
	"fileUrl" text NOT NULL,
	"mimeType" varchar(128),
	"fileSize" integer,
	"description" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
