import { supabase } from "@/lib/supa";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return <TasksClient initialTasks={tasks ?? []} />;
}
