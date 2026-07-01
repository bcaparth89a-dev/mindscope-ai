import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login to MindScope AI — Continue Your Self-Discovery Journey",
  description: "Secure login to access your MindScope AI chats. Reconnect with your AI psychology coach and continue tracking your emotional intelligence progress.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
