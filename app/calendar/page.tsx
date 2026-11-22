import {requireUser} from "@/lib/db";
import {redirect} from "next/navigation";
export default async function Calendar(){
 let x;try{x=await requireUser()}catch{redirect("/login")}
 const {data}=await x.db.from("posts").select("id,scheduled_at,content,status").not("scheduled_at","is",null).order("scheduled_at",{ascending:true}).limit(100);
 return <><h1>Content Calendar</h1><p className="muted">Only posts with approved content versions can be published by the worker.</p>{!data?.length&&<section className="card">Nothing scheduled yet.</section>}{data?.map(p=><article className="card" key={p.id}><div className="panel-title"><strong>{p.scheduled_at?new Date(p.scheduled_at).toLocaleString():"Unscheduled"}</strong><span className="tag">{p.status}</span></div><p className="pre">{p.content.slice(0,340)}{p.content.length>340?"…":""}</p></article>)}</>;
}