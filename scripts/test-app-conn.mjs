import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supa = createClient(url, anon);

const main = async () => {
  // hit a public table/RPC you already created; shop_items is perfect
  const { data, error } = await supa.from('shop_items').select('key,name,price').limit(3);
  console.log('URL:', url);
  if (error) {
    console.error('APP CONNECT ERROR:', error);
  } else {
    console.log('APP CONNECT OK ? sample:', data);
  }
};
main();
