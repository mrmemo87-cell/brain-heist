import { supa } from './supa';

export async function getInventory(){
  const { data, error } = await supa.rpc('rpc_inventory_for_me');
  if (error) throw error; return data;
}
export async function getActiveEffects(){
  const { data, error } = await supa.rpc('rpc_active_effects_for_me');
  if (error) throw error; return data;
}
export async function upgradeStat(target:'xp'|'credits'|'security', amount=1){
  const { error } = await supa.rpc('rpc_upgrade_stat',{ target, amount });
  if (error) throw error;
}
export async function activateItem(itemKey:string){
  const { data, error } = await supa.rpc('rpc_inventory_activate',{ p_item_key:itemKey });
  if (error) throw error; return data;
}