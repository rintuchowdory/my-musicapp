'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      setResult({ data, error });
    }
    fetchData();
  }, []);

  return (
    <pre>
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}
