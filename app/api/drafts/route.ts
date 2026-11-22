import {requireUser,errorResponse} from "@/lib/db";
import {generateDraft} from "@/lib/ai";
import {createHash} from "node:crypto";
import {z} from "zod";
export async function POST(req:Request){
  try{
    const {db,user}=await requireUser();
    const input=z.object({topic:z.string().trim().min(5).max(2000),voice:z.string().max(2000).default("Direct and thoughtful")}).parse(await req.json());
    const {data:facts,error:factsError}=await db.from("experience_facts").select("claim").eq("approved",true).limit(20);
    if(factsError)throw factsError;
    const content=await generateDraft(input.topic,(facts||[]).map(f=>f.claim),input.voice);
    if(!content) throw new Error("Empty AI response");
    const content_hash=createHash("sha256").update(content).digest("hex");
    const {data,error}=await db.from("posts").insert({owner_id:user.id,content,content_hash,status:"draft"}).select().single();
    if(error)throw error;
    return Response.json({post:data});
  }catch(e){return errorResponse(e)}
}