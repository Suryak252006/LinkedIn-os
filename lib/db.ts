import {createClient} from '@supabase/supabase-js';
export function adminDb(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})}
export function authorizedWorker(req:Request){if(!process.env.WORKER_SECRET || req.headers.get('authorization')!==`Bearer ${process.env.WORKER_SECRET}`) throw new Error('UNAUTHORIZED');}
