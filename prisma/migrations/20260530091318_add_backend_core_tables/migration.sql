/*
  Warnings:

  - You are about to drop the column `result` on the `PublishRecord` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PlatformAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "authType" TEXT NOT NULL DEFAULT 'mock',
    "status" TEXT NOT NULL DEFAULT 'connected',
    "configEncrypted" TEXT,
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "tokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformAccount_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdaptedContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "warnings" TEXT NOT NULL DEFAULT '[]',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "adaptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdaptedContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdaptedContent_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'simulate',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "platformCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    CONSTRAINT "PublishTask_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'markdown',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Content" ("body", "createdAt", "id", "title", "updatedAt") SELECT "body", "createdAt", "id", "title", "updatedAt" FROM "Content";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
CREATE TABLE "new_Platform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxTitleLength" INTEGER NOT NULL DEFAULT 80,
    "maxContentLength" INTEGER NOT NULL DEFAULT 20000,
    "requiredFields" TEXT NOT NULL DEFAULT '[]',
    "styleGuide" TEXT NOT NULL DEFAULT '',
    "adapterKey" TEXT NOT NULL DEFAULT '',
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Platform" ("config", "createdAt", "displayName", "enabled", "id", "name", "updatedAt") SELECT "config", "createdAt", "displayName", "enabled", "id", "name", "updatedAt" FROM "Platform";
DROP TABLE "Platform";
ALTER TABLE "new_Platform" RENAME TO "Platform";
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");
CREATE TABLE "new_PublishRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT,
    "contentId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "adaptedContentId" TEXT,
    "accountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT NOT NULL DEFAULT '',
    "platformPostId" TEXT,
    "platformUrl" TEXT,
    "requestSnapshot" TEXT,
    "responseSnapshot" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublishRecord_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "PublishTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PublishRecord_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishRecord_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishRecord_adaptedContentId_fkey" FOREIGN KEY ("adaptedContentId") REFERENCES "AdaptedContent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PublishRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlatformAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PublishRecord" ("contentId", "createdAt", "id", "platformId", "publishedAt", "status") SELECT "contentId", "createdAt", "id", "platformId", "publishedAt", "status" FROM "PublishRecord";
DROP TABLE "PublishRecord";
ALTER TABLE "new_PublishRecord" RENAME TO "PublishRecord";
CREATE INDEX "PublishRecord_taskId_idx" ON "PublishRecord"("taskId");
CREATE INDEX "PublishRecord_contentId_idx" ON "PublishRecord"("contentId");
CREATE INDEX "PublishRecord_platformId_idx" ON "PublishRecord"("platformId");
CREATE INDEX "PublishRecord_adaptedContentId_idx" ON "PublishRecord"("adaptedContentId");
CREATE INDEX "PublishRecord_accountId_idx" ON "PublishRecord"("accountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlatformAccount_platformId_idx" ON "PlatformAccount"("platformId");

-- CreateIndex
CREATE INDEX "AdaptedContent_platformId_idx" ON "AdaptedContent"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "AdaptedContent_contentId_platformId_key" ON "AdaptedContent"("contentId", "platformId");

-- CreateIndex
CREATE INDEX "PublishTask_contentId_idx" ON "PublishTask"("contentId");
