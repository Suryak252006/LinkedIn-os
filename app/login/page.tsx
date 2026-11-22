"use client";
import {useState} from "react";
import {createBrowserClient} from "@supabase/ssr";
export default function Login(){
 const [email,setEmail]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 async function signIn(){
  setBusy(true);
  try{const db=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+"/auth/callback",shouldCreateUser:false}});setMessage(error?.message||"Check your inbox for the login link.");}
  catch(e){setMessage(String(e))}finally{setBusy(false)}
 }
 return <section className="card" style={{maxWidth:520,margin:"48px auto"}}><h1>Sign in</h1><p className="muted">Only an existing authorized Supabase user can access the workspace.</p><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><p><button onClick={signIn} disabled={busy||!email.includes("@")}>{busy?"Sending…":"Send magic link"}</button></p>{message&&<p role="status">{message}</p>}</section>;
}