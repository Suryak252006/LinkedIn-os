import OpenAI from "openai";
export async function generateDraft(topic:string,facts:string[],voice:string){
  if(!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const response=await client.chat.completions.create({
    model:process.env.OPENAI_MODEL||"gpt-4.1-mini",
    temperature:0.65,
    messages:[
      {role:"system",content:"Write LinkedIn posts for a student builder interested in startups, growth, EdTech and product operations. Voice: "+voice+". Never invent personal experience, metrics, events, quotes, sources or external facts. Use specific opening, short readable paragraphs and a practical takeaway. If no verified facts apply, frame content as hypotheses or opinion rather than personal history. Return only the post."},
      {role:"user",content:"Topic:\n"+topic+"\nVerified personal facts (only these may support first-person claims):\n"+(facts.join("\n")||"None")+"\nLength: 120 to 220 words."}
    ]
  });
  return response.choices[0]?.message?.content?.trim()||"";
}