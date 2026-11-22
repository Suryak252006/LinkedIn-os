import {NextRequest,NextResponse} from "next/server";
import {userDb} from "@/lib/db";
export async function GET(req:NextRequest){
  const code=req.nextUrl.searchParams.get("code");
  if(!code)return NextResponse.redirect(new URL("/login?error=missing_code",req.url));
  const db=await userDb();
  const {error}=await db.auth.exchangeCodeForSession(code);
  if(error)return NextResponse.redirect(new URL("/login?error=auth_failed",req.url));
  return NextResponse.redirect(new URL("/",req.url));
}