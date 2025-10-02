'use client';
export const dynamic = 'force-dynamic';

import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/rpc';
import { useEffect, useState } from 'react';

type Item = {
  item_id:number; key:string; name:string; type:'consumable'|'cosmetic'|'other';
  price:number; price_effective:number;
  image_url:string|null; thumb_url:string|null; image_alt:string|null;
  stock_limit:number|null; per_user_daily_limit:number|null;
};

export default function Shop() {
  const [items,setItems]=useState<Item[]>([]);
  const [msg,setMsg]=useState<string|undefined>();
  const load = async()=>{ setItems(await api.shopList() as Item[]); };
  useEffect(()=>{ load(); },[]);

  const buy = async(id:number)=>{ setMsg(undefined); try{
    await api.shopBuy(id); await load(); setMsg('Purchased!'); }catch(e:any){ setMsg(e.message); } };

  const activate = async(key:string)=>{ setMsg(undefined); try{
    await api.activateItem(key); setMsg('Activated!'); }catch(e:any){ setMsg(e.message); } };

  const equip = async(key:string)=>{ setMsg(undefined); try{
    await api.equipFlair(key); setMsg('Equipped!'); }catch(e:any){ setMsg(e.message); } };

  return (
    <AuthGate>
      <h1 className="text-xl font-semibold mb-4">Shop</h1>
      {msg && <div className="mb-3 text-sm text-emerald-400">{msg}</div>}
      <div className="grid gap-3">
        {items.map(i=>(
          <div key={i.item_id} className="bg-slate-900 rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={i.thumb_url ?? i.image_url ?? ''} alt={i.image_alt ?? i.name} className="w-12 h-12 rounded bg-slate-800 object-cover" />
              <div>
                <div className="font-semibold">{i.name}</div>
                <div className="text-sm text-slate-400">{i.key} • {i.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-300">{i.price_effective}c</div>
              <button onClick={()=>buy(i.item_id)} className="px-3 py-1 bg-slate-800 rounded">Buy</button>
              {i.type==='consumable' && <button onClick={()=>activate(i.key)} className="px-3 py-1 bg-emerald-600 rounded">Activate</button>}
              {i.type==='cosmetic' && <button onClick={()=>equip(i.key)} className="px-3 py-1 bg-emerald-600 rounded">Equip</button>}
            </div>
          </div>
        ))}
      </div>
    </AuthGate>
  );
}
