import {requireUser} from "@/lib/db";
import {redirect} from "next/navigation";
export default async function Settings(){
 try{await requireUser()}catch{redirect("/login")}
 return <><h1>Settings</h1><div className="card"><h2>Publishing</h2><p>Set PUBLISH_MODE=mock for dry runs. Live LinkedIn publishing requires separately authorized OAuth access and a supported LinkedIn API version.</p><p className="alert">Never paste your Supabase service-role key, OpenAI key, LinkedIn access token or worker secret into GitHub.</p></div><div className="card"><h2>Workflow integrations</h2><p>Import the JSON workflows from the n8n directory. Set GROWTH_OS_URL and GROWTH_OS_WORKER_SECRET in your n8n runtime or a secure credential.</p></div></>;
}