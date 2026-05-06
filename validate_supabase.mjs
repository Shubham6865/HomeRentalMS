import { createClient } from '@supabase/supabase-js';
const url = 'https://iuxnqzmiojrkgsgoflhh.supabase.co';
const key = 'sb_publishable_r96xHnJmxULbfsAMjd704Q_rX_XtxMy';
const supabase = createClient(url, key);
const q = supabase.from('users');
console.log('has eq?', typeof q.eq, q.eq ? 'yes' : 'no');
console.log('has select?', typeof q.select, q.select ? 'yes' : 'no');
console.log('q type', Object.prototype.toString.call(q));
console.log('keys', Object.keys(q).slice(0,20));
