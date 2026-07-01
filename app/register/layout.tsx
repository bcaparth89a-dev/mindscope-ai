import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | MindScope AI — Start Your Reality Mirror Analysis",
  description: "Sign up for MindScope AI and start your self-reflection journey today. Master communication, recover from rejection, and build accountable habits.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
