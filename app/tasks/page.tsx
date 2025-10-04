import QuestionModal from '@/components/QuestionModal';
await api.taskClaim(id); SFX.claim();

// ...
const [qid,setQid]=useState<number|null>(null);
// ...
{/* replace +1 with Answer */}
{!t.completed && (
  <button onClick={()=>setQid(t.id)} className="btn btn-ghost">Answer</button>
)}
{qid && <QuestionModal userTaskId={qid} onClose={()=>setQid(null)} onAnswered={async(ok)=>{ if(ok){ await refresh(); } }} />}
