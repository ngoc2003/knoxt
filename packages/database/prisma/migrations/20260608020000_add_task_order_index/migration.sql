CREATE INDEX "Task_projectId_status_orderIndex_idx"
ON "Task"("projectId", "status", "orderIndex");
