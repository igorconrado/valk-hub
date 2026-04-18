import React from "react";

const highlight = "text-[#ccc]";

export function getActionText(
  action: string,
  metadata: Record<string, string> | null
): React.ReactNode {
  const projectName = metadata?.project_name || metadata?.name;
  const memberName = metadata?.member_name;
  const taskTitle = metadata?.task_title;
  const title = metadata?.title;
  const reason = metadata?.reason;

  switch (action) {
    // Projects
    case "created_project":
    case "project_created":
      return (
        <>
          criou o projeto <span className={highlight}>{projectName}</span>
        </>
      );
    case "updated_project":
      return (
        <>
          atualizou o projeto <span className={highlight}>{projectName}</span>
        </>
      );
    case "deleted_project":
      return (
        <>
          excluiu o projeto <span className={highlight}>{projectName}</span>
        </>
      );

    // Members
    case "added_member":
      return (
        <>
          adicionou <span className={highlight}>{memberName}</span> ao projeto
        </>
      );
    case "removed_member":
      return (
        <>
          removeu <span className={highlight}>{memberName}</span> do projeto
        </>
      );

    // Tasks
    case "created_task":
      return (
        <>
          criou a task <span className={highlight}>{taskTitle}</span>
        </>
      );
    case "updated_task":
    case "task_updated":
      return (
        <>
          atualizou{" "}
          <span className={highlight}>
            {taskTitle || metadata?.field || "task"}
          </span>
        </>
      );
    case "completed_task":
      return (
        <>
          concluiu a task <span className={highlight}>{taskTitle}</span>
        </>
      );
    case "task_status_changed":
      return (
        <>
          moveu task para{" "}
          <span className={highlight}>{metadata?.status}</span>
        </>
      );
    case "blocked_task":
      return (
        <>
          bloqueou task
          {reason && (
            <>
              : <span className={highlight}>{reason}</span>
            </>
          )}
        </>
      );
    case "unblocked_task":
    case "task_block_resolved":
      return (
        <>
          desbloqueou task{" "}
          {taskTitle && <span className={highlight}>{taskTitle}</span>}
        </>
      );

    // Documents
    case "created_document":
      return (
        <>
          criou o documento{" "}
          <span className={highlight}>{title || "sem título"}</span>
        </>
      );
    case "updated_document":
      return (
        <>
          atualizou o documento{" "}
          <span className={highlight}>{title || "sem título"}</span>
        </>
      );
    case "deleted_document":
      return (
        <>
          excluiu o documento{" "}
          <span className={highlight}>{title || "sem título"}</span>
        </>
      );
    case "restored_document_version":
      return "restaurou versão de documento";

    // Meetings
    case "created_meeting":
      return (
        <>
          agendou reunião <span className={highlight}>{title}</span>
        </>
      );
    case "updated_meeting":
    case "meeting_status_changed":
      return (
        <>
          atualizou reunião para{" "}
          <span className={highlight}>{metadata?.status}</span>
        </>
      );
    case "completed_meeting":
      return (
        <>
          concluiu reunião <span className={highlight}>{title}</span>
        </>
      );

    // Decisions
    case "registered_decision":
    case "created_decision":
      return (
        <>
          registrou decisão <span className={highlight}>{title}</span>
        </>
      );

    // Action items
    case "created_action_item":
      return (
        <>
          criou action item <span className={highlight}>{title}</span>
        </>
      );
    case "completed_action_item":
      return (
        <>
          concluiu action item <span className={highlight}>{title}</span>
        </>
      );

    // Reports
    case "created_report":
      return (
        <>
          gerou relatório <span className={highlight}>{title}</span>
        </>
      );
    case "published_report":
      return (
        <>
          publicou relatório{" "}
          {title && <span className={highlight}>{title}</span>}
        </>
      );

    // People
    case "invited_user":
      return (
        <>
          convidou <span className={highlight}>{metadata?.name}</span> ao time
        </>
      );
    case "updated_profile":
      return (
        <>
          atualizou perfil de{" "}
          <span className={highlight}>{metadata?.name}</span>
        </>
      );

    default:
      return action.replace(/_/g, " ");
  }
}
