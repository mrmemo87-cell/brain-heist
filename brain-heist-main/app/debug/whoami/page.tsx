'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supa';

export default function WhoAmI() {
  const [out, setOut] = useState<any>({ loading: true });

  useEffect(() => {
    (async () => {
      const sess = await supabase.auth.getSession();
      const session = sess.data.session;
      const uid = session?.user?.id ?? null;

      let userRow = null;
      if (uid) {
        const { data } = await supabase.from('users').select('*').eq('uid', uid).maybeSingle();
        userRow = data ?? null;
      }
      setOut({ session, uid, userRow, loading: false });
    })();
  }, []);

  return (
    <pre className="p-4 text-xs overflow-auto bg-black/20 rounded-xl">
      {JSON.stringify(out, null, 2)}
    </pre>
  );
}
