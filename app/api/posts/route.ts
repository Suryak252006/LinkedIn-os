import {requireUser,errorResponse} from "@/lib/db";
import {createHash} from "node:crypto";
import {z} from "zod";
export async function GET(){
  try{
    const {db}=await requireUser();
    const {data,error}=await db.from("posts").select("id,content,status,version,scheduled_at,approved_at,published_at,last_error").order("created_at",{ascending:false}).limit(100);
    if(error)throw error;
    return Response.json({posts:data});
  }catch(e){return errorResponse(e)}
}
export async function PATCH(req:Request){
  try{
    const {db,user}=await requireUser();
    const v=z.object({id:z.string().uuid(),action:z.enum(["edit","approve","schedule","cancel"]),content:z.string().max(5000).optional(),scheduled_at:z.string().datetime({offset:true}).optional()}).parse(await req.json());
    const {data:p,error:e}=await db.from("posts").select("*").eq("id",v.id).single();
    if(e||!p)throw new Error("Post not found");
    let patch:Record<string,unknown>={};
    if(v.action==="edit"){
      if(!["draft","review","approved","scheduled"].includes(p.status))throw new Error("Not editable");
      if(!v.content?.trim())throw new Error("Content required");
      patch={content:v.content,content_hash:createHash("sha256").update(v.content).digest("hex"),version:p.version+1,approved_version:null,approved_at:null,approved_by:null,scheduled_at:null,status:"draft"};
    }
    if(v.action==="approve"){
      if(!["draft","review","approved"].includes(p.status))throw new Error("Cannot approve");
      patch={status:"approved",approved_version:p.version,approved_by:user.id,approved_at:new Date().toISOString()};
    }
    if(v.action==="schedule"){
      if(p.status!=="approved"||p.approved_version!==p.version)throw new Error("Approve exact current version first");
      if(!v.scheduled_at||Date.parse(v.scheduled_at)<=Date.now())throw new Error("Future time required");
      patch={status:"scheduled",scheduled_at:v.scheduled_at};
    }
    if(v.action==="cancel"){
      if(!["draft","review","approved","scheduled","failed"].includes(p.status))throw new Error("Cannot cancel");
      patch={status:"cancelled",scheduled_at:null};
    }
    const {data,error}=await db.from("posts").update(patch).eq("id",v.id).eq("status",p.status).eq("version",p.version).eq("updated_at",p.updated_at).select().maybeSingle();
    if(error||!data)throw new Error("Concurrent change or update failure. Reload and retry.");
    return Response.json({post:data});
  }catch(e){return errorResponse(e)}
}