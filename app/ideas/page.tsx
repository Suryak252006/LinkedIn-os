"use client";
import {useEffect,useState} from "react";
type Idea={id:string;title:string;status:string;score:number|null};
export default function Ideas(){
 const [topic,setTopic]=useState("");const [ideas,setIdeas]=useState<Idea[]>([]);const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 async function load(){const r=await fetch("/api/ideas");const d=await r.json();if(r.ok)setIdeas(d.ideas||[]);else setMessage(d.error||"Unable to load ideas")}
 useEffect(()=>{void load()},[]);
 async function create(){setBusy(true);try{const r=await fetch("/api/ideas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic})});const d=await r.json();if(!r.ok)throw Error(d.error);setTopic("");setMessage("Idea saved");await load()}catch(e){setMessage(String(e))}finally{setBusy(false)}}
 return <><h1>Idea Inbox</h1><p className="muted">Save your observations and personal research. The daily worker drafts from this backlog; it does not invent news.</p><section className="card"><label htmlFor="topic"><strong>New idea</strong></label><textarea id="topic" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Write a specific insight, experiment or topic and any verified context."/><div className="actions"><button onClick={create} disabled={busy||topic.trim().length<5}>{busy?"Saving…":"Save idea"}</button><span className="muted small">{message}</span></div></section><h2>Backlog</h2>{ideas.length===0?<p className="muted">No ideas yet.</p>:ideas.map(i=><article key={i.id} className="card"><div className="panel-title"><strong>{i.title}</strong><span className="tag">{i.status}</span></div>{i.score!=null&&<p className="small muted">Topic score: {i.score}</p>}</article>)}</>;
}