import React, { useEffect, useState } from "react";
import { rpcShopList, rpcShopBuy } from "@/lib/api";

export default function Shop() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await rpcShopList();
        setItems(Array.isArray(data) ? data : (data ?? []));
      } catch (e) {
        console.error(e);
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function buy(key:string) {
    try {
      const r = await rpcShopBuy(key);
      console.log("buy", r);
      alert(JSON.stringify(r));
    } catch (e:any) {
      alert(e.message || String(e));
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2">Shop</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it:any) => (
          <div key={it.id ?? it.item_key} className="p-3 rounded bg-[rgba(255,255,255,0.02)]">
            <div className="font-semibold text-white">{it.title ?? it.item_key}</div>
            <div className="text-xs text-gray-300">{(it.meta && it.meta.desc) ?? ""}</div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm">{it.price ?? it.cost} ⚡</div>
              <button onClick={()=>buy(it.item_key)} className="px-2 py-1 rounded bg-cyan-500 text-black text-sm">Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
