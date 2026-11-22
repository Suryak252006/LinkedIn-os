import {adminDb,authorizedWorker,errorResponse} from "@/lib/db";
import {publish} from "@/lib/publisher";
export async function POST(req:Request){
  try{
    authorizedWorker(req);
    const db=adminDb();
    const {data:claimed,error}=await db.rpc("claim_due_posts",{max_items:5});
    if(error)throw error;
    const results=[];
    for(const p of claimed||[]){
      let status="published";
      let externalId:string|null=null;
      let errorMessage:string|null=null;
      try{
        const result=await publish(p.content);
        externalId=result.id;
        status=result.mock?"mock_published":"published";
      }catch(e){
        errorMessage=String(e);
        status=errorMessage.includes("UNKNOWN_DELIVERY")?"unknown_delivery":"failed";
      }
      const {error:finishError}=await db.rpc("finish_publish",{p_post_id:p.id,p_claim_token:p.claim_token,p_status:status,p_external_id:externalId,p_error:errorMessage});
      results.push({id:p.id,status,error:errorMessage,finalizeError:finishError?.message||null});
    }
    return Response.json({results});
  }catch(e){return errorResponse(e)}
}