"use client";
import React, { memo } from "react";

type Task = {
  id: string;
  created_at: string;
  status?: string;
  [k: string]: any;
};

function TaskItem({ task, onAnswer }: { task: Task; onAnswer: (id: string, answer: string) => void }) {
  return (
    <div className="rounded border p-3">
      <div className="text-sm opacity-70 mb-2">
        {new Date(task.created_at).toLocaleString()}
      </div>

      {/* replace with your real task UI */}
      <div className="flex items-center gap-2">
        <button
          className="rounded bg-black/80 px-3 py-1 text-white"
          onClick={() => onAnswer(task.id, "42")}
        >
          Answer “42”
        </button>
        {task.status && <span className="text-xs opacity-70">status: {task.status}</span>}
      </div>
    </div>
  );
}

export default memo(TaskItem);