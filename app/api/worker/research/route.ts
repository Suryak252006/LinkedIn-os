import {adminDb,authorizedWorker,errorResponse} from "@/lib/db";
import {generateDraft} from "@/lib/ai";
import {createHash} from "node:crypto";
export async function POST(req:Request){
  try{
    authorizedWorker(req);
    const db=adminDb();
    const owner=process.env.OWNER_USER_ID;
    if(!owner)throw new Error("OWNER_USER_ID not configured");
    const {data:ideas,error}=await db.from("ideas").select("id,angle").eq("owner_id",owner).eq("status","inbox").order("created_at",{ascending:true}).limit(1);
    if(error)throw error;
    if(!ideas?.length)return Response.json({message:"No pending ideas. Nothing generated."});
    const idea=ideas[0];
    const {data:facts,error:factsError}=await db.from("experience_facts").select("claim").eq("owner_id",owner).eq("approved",true).limit(20);
    if(factsError)throw factsError;
    const {data:examples,error:examplesError}=await db.from("voice_examples").select("content").eq("owner_id",owner).order("quality_score",{ascending:false}).limit(3);
    if(examplesError)throw examplesError;
    const voice="Direct and specific. Style examples: "+(examples||[]).map(x=>x.content.slice(0,500)).join(" | ");
    const content=await generateDraft(idea.angle,(facts||[]).map(f=>f.claim),voice);
    if(!content)throw new Error("Empty generated draft");
    const hash=createHash("sha256").update(content).digest("hex");
    const {data:post,error:postError}=await db.from("posts").insert({owner_id:owner,idea_id:idea.id,content,content_hash:hash,status:"draft"}).select("id").single();
    if(postError)throw postError;
    const {error:ideaError}=await db.from("ideas").update({status:"drafted"}).eq("id",idea.id);
    if(ideaError)throw ideaError;
    return Response.json({post_id:post.id,idea_id:idea.id});
  }catch(e){return errorResponse(e)}
}