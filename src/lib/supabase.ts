import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brtfltztxkvlywkrqouy.supabase.co';

const supabaseKey = 'sb_publishable_k7uUoXH7N22fD0fQ_8DEvw_SPV6LHYZ';

export const supabase = createClient(supabaseUrl, supabaseKey);