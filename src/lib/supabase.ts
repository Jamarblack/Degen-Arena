import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brtfltztxkvlywkrqouy.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydGZsdHp0eGt2bHl3a3Jxb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTAzMzEsImV4cCI6MjA4MDAyNjMzMX0.XPVtTvQ7DIsnZkZWZtqt6_JI9OhnVV_BLL8mBfSOjtI';

export const supabase = createClient(supabaseUrl, supabaseKey);

