'use client';
import { memo } from 'react';

type Task = { id: string; created_at: string; status?: string; [k: string]: any };

function TaskItemImpl({ task, onAnswer }: { task: Task; onAnswer: (id: string, a: string) => void }) {
  return (
    <li className="rounded border p-3">
      <div className="text-sm opacity-70">{new Date(task.created_at).toLocaleString()}</div>
      {/* replace with your UI */}
      <button className="mt-2 rounded bg-black/80 px-3 py-1 text-white" onClick={() => onAnswer(task.id, '42')}>
        Answer
      </button>
      {task.status && <div className="text-xs opacity-70 mt-1">{task.status}</div>}
    </li>
  );
}

const TaskItem = memo(TaskItemImpl);
export default TaskItem;
