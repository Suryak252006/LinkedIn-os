import type {ReactNode} from "react";
import Link from "next/link";
import "./globals.css";
export const metadata={title:"LinkedIn Growth OS",description:"Private content studio and approval-first LinkedIn scheduler"};
export default function RootLayout({children}:{children:ReactNode}){
 return <html lang="en"><body><header className="nav"><nav className="nav-inner" aria-label="Main"><Link className="brand" href="/">Growth OS</Link><Link href="/ideas">Ideas</Link><Link href="/drafts">Drafts</Link><Link href="/calendar">Calendar</Link><Link href="/analytics">Analytics</Link><Link href="/settings">Settings</Link></nav></header><main className="container">{children}</main></body></html>;
}