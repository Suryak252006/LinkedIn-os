import Link from "next/link";
import {redirect} from "next/navigation";
import {requireUser} from "@/lib/db";
export default async function Home(){
 let x;try{x=await requireUser()}catch{redirect("/login")}
 const [ideas,drafts,scheduled,published]=await Promise.all([
  x.db.from("ideas").select("*",{count:"exact",head:true}),
  x.db.from("posts").select("*",{count:"exact",head:true}).in("status",["draft","review"]),
  x.db.from("posts").select("*",{count:"exact",head:true}).eq("status","scheduled"),
  x.db.from("posts").select("*",{count:"exact",head:true}).in("status",["published","mock_published"])
 ]);
 return <><h1>LinkedIn Growth OS</h1><p className="muted">Your content production, review and publishing dashboard.</p><div className="alert"><strong>Safety:</strong> posts only enter the publication queue after explicit approval. The default publisher is mock-only.</div><div className="grid" style={{marginTop:20}}>{[{name:"Ideas",count:ideas.count,href:"/ideas"},{name:"Drafts to review",count:drafts.count,href:"/drafts"},{name:"Scheduled",count:scheduled.count,href:"/calendar"},{name:"Published / mocked",count:published.count,href:"/analytics"}].map(v=><Link key={v.name} href={v.href} className="card" style={{color:"inherit"}}><p className="muted">{v.name}</p><div className="metric">{v.count??"—"}</div><span className="small" style={{color:"#165fe6"}}>Open →</span></Link>)}</div><section className="card"><h2>Start here</h2><p>Save a useful observation, generate a draft in your voice, review it, and schedule the exact approved version.</p><div className="actions"><Link href="/ideas"><button>New idea</button></Link><Link href="/drafts"><button className="secondary">Open draft studio</button></Link></div></section></>;
}