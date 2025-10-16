// components/Inventory.tsx
import React, { useEffect, useState } from 'react';
import { rpcInventoryForMe, rpcInventoryActivate } from '@/lib/api';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try {
        const data = await rpcInventoryForMe();
        if (mounted) setItems(data ?? []);
      } catch(e){ console.error(e); }
    })();
    return ()=>{ mounted = false; };
  },[]);
  async function activate(key:string){
    try{
      const r = await rpcInventoryActivate(key);
      alert(JSON.stringify(r));
    }catch(e:any){
      alert(e.message || String(e));
    }
  }
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2">Inventory</h3>
      <div className="grid grid-cols-3 gap-2">
        {items.length===0 && <div className="text-xs text-gray-400">Empty</div>}
        {items.map((it:any)=>(
          <div key={it.id ?? it.item_key} className="p-2 rounded bg-[rgba(255,255,255,0.02)]">
            <div className="text-xs">{it.item_key}</div>
            <button onClick={()=>activate(it.item_key)} className="mt-2 px-2 py-1 rounded bg-purple-500 text-white text-xs">Use</button>
          </div>
        ))}
      </div>
    </div>
  );
}
