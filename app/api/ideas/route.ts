import {requireUser,errorResponse} from "@/lib/db";
import {z} from "zod";
export async function GET(){
  try {const {db}=await requireUser();const {data,error}=await db.from("ideas").select("*").order("created_at",{ascending:false}).limit(100);if(error)throw error;return Response.json({ideas:data});}
  catch(e){return errorResponse(e)}
}
export async function POST(req:Request){
  try {
    const {db,user}=await requireUser();
    const {topic}=z.object({topic:z.string().trim().min(5).max(3000)}).parse(await req.json());
    const {data,error}=await db.from("ideas").insert({owner_id:user.id,title:topic.slice(0,140),angle:topic,status:"inbox"}).select().single();
    if(error)throw error;
    return Response.json({idea:data});
  } catch(e){return errorResponse(e)}
}