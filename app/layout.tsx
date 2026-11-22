import type { ReactNode } from 'react';
export const metadata = { title: 'LinkedIn Growth OS', description: 'Approval-first LinkedIn content engine' };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body style={{fontFamily:'system-ui',maxWidth:960,margin:'40px auto',padding:20}}>{children}</body></html>; }
