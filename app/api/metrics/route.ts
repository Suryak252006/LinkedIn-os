import {requireUser,errorResponse} from "@/lib/db";
import {z} from "zod";
export async function POST(req:Request){
  try{
    const {db,user}=await requireUser();
    const x=z.object({post_id:z.string().uuid(),impressions:z.number().int().nonnegative().nullable().optional(),reactions:z.number().int().nonnegative().nullable().optional(),comments:z.number().int().nonnegative().nullable().optional(),reposts:z.number().int().nonnegative().nullable().optional()}).parse(await req.json());
    const {data:p,error:lookupError}=await db.from("posts").select("id").eq("id",x.post_id).maybeSingle();
    if(lookupError||!p)throw new Error("Post not found");
    const {data,error}=await db.from("post_metrics").insert({...x,owner_id:user.id,source:"manual"}).select().single();
    if(error)throw error;
    return Response.json({metric:data});
  }catch(e){return errorResponse(e)}
}