-- CreateIndex
CREATE INDEX "iCalHomeworkState_userId_homeworkId_idx" ON "iCalHomeworkState"("userId", "homeworkId");

-- CreateIndex
CREATE INDEX "session_userId_token_idx" ON "session"("userId", "token");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "userHomework_id_userId_idx" ON "userHomework"("id", "userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
