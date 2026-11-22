export async function publish(content:string):Promise<{id:string;mock:boolean}>{
  if(process.env.PUBLISH_MODE!=="live") return {id:"mock-"+crypto.randomUUID(),mock:true};
  const token=process.env.LINKEDIN_ACCESS_TOKEN;
  const author=process.env.LINKEDIN_AUTHOR_URN;
  const version=process.env.LINKEDIN_API_VERSION;
  if(!token||!author||!version)throw new Error("LinkedIn credentials missing");
  let response:Response;
  try {
    response=await fetch("https://api.linkedin.com/rest/posts",{
      method:"POST",
      headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json","X-Restli-Protocol-Version":"2.0.0","Linkedin-Version":version},
      body:JSON.stringify({author,commentary:content,visibility:"PUBLIC",distribution:{feedDistribution:"MAIN_FEED",targetEntities:[],thirdPartyDistributionChannels:[]},lifecycleState:"PUBLISHED",isReshareDisabledByAuthor:false})
    });
  } catch(e) {
    throw new Error("UNKNOWN_DELIVERY: network failure after request may have reached provider: "+String(e));
  }
  if(!response.ok) {
    const body=(await response.text()).slice(0,300);
    throw new Error("LINKEDIN_"+response.status+": "+body);
  }
  const id=response.headers.get("x-restli-id");
  if(!id) throw new Error("UNKNOWN_DELIVERY: LinkedIn succeeded without a post ID");
  return {id,mock:false};
}