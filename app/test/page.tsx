import { supabase } from '@/lib/supabaseClient';

export default async function TestPage() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);

  return (
    <pre>
      {JSON.stringify({ data, error }, null, 2)}
    </pre>
  );
}
