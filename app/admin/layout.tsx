import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Box, Typography, Container, Stack, Avatar } from "@mui/material";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  
  const adminEmailsStr = process.env.ADMIN_EMAILS || "bercho001@gmail.com,fernandosoria1379@gmail.com";
  const ADMIN_EMAILS = adminEmailsStr.split(",").map(e => e.trim());

  if (!email || !ADMIN_EMAILS.includes(email)) {
    redirect("/");
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
             <span style={{ fontWeight: 800, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block' }}>RESTRICTED ACCESS</span>
             <h1 style={{ fontWeight: 800, letterSpacing: '-0.05em', marginTop: '0.5rem', fontSize: '2rem' }}>ADMIN COMMAND CENTER</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <span style={{ fontWeight: 600, opacity: 0.6, fontSize: '0.875rem' }}>{email}</span>
             <div style={{ backgroundColor: 'white', color: 'black', fontWeight: 800, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.firstName?.[0] || "A"}
             </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
