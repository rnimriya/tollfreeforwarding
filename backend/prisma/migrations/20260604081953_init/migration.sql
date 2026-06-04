-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'STARTER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "virtual_numbers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "e164_number" TEXT NOT NULL,
    "friendly_name" TEXT,
    "country_code" TEXT NOT NULL,
    "number_type" TEXT NOT NULL DEFAULT 'LOCAL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "voicemail_greeting" TEXT,
    "ivr_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ivr_flow" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "virtual_numbers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routing_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "virtual_number_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL DEFAULT 'Rule',
    "active_days" TEXT NOT NULL DEFAULT '1,2,3,4,5',
    "open_time" TEXT,
    "close_time" TEXT,
    "action" TEXT NOT NULL DEFAULT 'FORWARD_PSTN',
    "destinations" TEXT NOT NULL DEFAULT '[]',
    "ring_strategy" TEXT NOT NULL DEFAULT 'SEQUENTIAL',
    "ring_timeout" INTEGER NOT NULL DEFAULT 30,
    "sip_uri" TEXT,
    "ivr_node_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "routing_rules_virtual_number_id_fkey" FOREIGN KEY ("virtual_number_id") REFERENCES "virtual_numbers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "virtual_number_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_call_sid" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "caller_number" TEXT NOT NULL,
    "called_number" TEXT NOT NULL,
    "forwarded_to" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "duration" INTEGER,
    "routing_rule_id" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    CONSTRAINT "call_logs_virtual_number_id_fkey" FOREIGN KEY ("virtual_number_id") REFERENCES "virtual_numbers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "call_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_numbers_e164_number_key" ON "virtual_numbers"("e164_number");
