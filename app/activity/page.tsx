import HackFeed from "@/components/HackFeed";

export default function Activity() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Batch Activity</h1>
      <HackFeed limit={30} />
    </div>
  );
}
