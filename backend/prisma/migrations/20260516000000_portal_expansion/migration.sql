CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT', 'REPORT', 'TICKET');

ALTER TABLE "TicketComment"
ADD CONSTRAINT "TicketComment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "clientCompanyId" TEXT,
  "type" "NotificationType" NOT NULL DEFAULT 'INFO',
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeBaseArticle" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "KnowledgeBaseArticle_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_clientCompanyId_fkey"
FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
