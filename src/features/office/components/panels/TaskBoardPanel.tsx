"use client";

import type { ComponentProps } from "react";
import type { AgentState } from "@/features/agents/state/store";
import { TaskBoardView, type ConnectionDebugInfo } from "@/features/office/tasks/TaskBoardView";
import type { TaskBoardCard, TaskBoardStatus } from "@/features/office/tasks/types";
import type { CronJobSummary } from "@/lib/cron/types";

export function TaskBoardPanel({
  agents,
  cardsByStatus,
  selectedCard,
  activeRuns,
  cronJobs,
  cronLoading,
  cronError,
  taskCaptureDebug,
  workerOnline,
  connectionDebug,
  onCreateCard,
  onMoveCard,
  onSelectCard,
  onUpdateCard,
  onDeleteCard,
  onRefreshCronJobs,
}: {
  agents: AgentState[];
  cardsByStatus: Record<TaskBoardStatus, TaskBoardCard[]>;
  selectedCard: TaskBoardCard | null;
  activeRuns: Array<{ runId: string; agentId: string; label: string }>;
  cronJobs: CronJobSummary[];
  cronLoading: boolean;
  cronError: string | null;
  taskCaptureDebug?: ComponentProps<typeof TaskBoardView>["taskCaptureDebug"];
  workerOnline: boolean;
  connectionDebug?: ConnectionDebugInfo;
  onCreateCard: () => void;
  onMoveCard: (cardId: string, status: TaskBoardStatus) => void;
  onSelectCard: (cardId: string | null) => void;
  onUpdateCard: (cardId: string, patch: Partial<TaskBoardCard>) => void;
  onDeleteCard: (cardId: string) => void;
  onRefreshCronJobs: () => void;
}) {
  return (
    <TaskBoardView
      title="Kanban"
      subtitle="Manual tasks, inferred requests, and scheduled playbooks."
      agents={agents}
      cardsByStatus={cardsByStatus}
      selectedCard={selectedCard}
      activeRuns={activeRuns}
      cronJobs={cronJobs}
      cronLoading={cronLoading}
      cronError={cronError}
      taskCaptureDebug={taskCaptureDebug}
      workerOnline={workerOnline}
      connectionDebug={connectionDebug}
      onCreateCard={onCreateCard}
      onMoveCard={onMoveCard}
      onSelectCard={onSelectCard}
      onUpdateCard={onUpdateCard}
      onDeleteCard={onDeleteCard}
      onRefreshCronJobs={onRefreshCronJobs}
    />
  );
}
