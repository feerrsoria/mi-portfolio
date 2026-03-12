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
    <Box sx={{ minHeight: '100vh', bgcolor: 'black', color: 'white', py: 8 }}>
      <Container maxWidth="xl">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 6 }}>
          <Box>
             <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>RESTRICTED ACCESS</Typography>
             <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em', mt: 1 }}>ADMIN COMMAND CENTER</Typography>
          </Box>
          <Stack direction="row" spacing={3} alignItems="center">
             <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.6 }}>{email}</Typography>
             <Avatar sx={{ bgcolor: 'white', color: 'black', fontWeight: 800 }}>
                {user?.firstName?.[0] || "A"}
             </Avatar>
          </Stack>
        </Stack>
        {children}
      </Container>
    </Box>
  );
}
