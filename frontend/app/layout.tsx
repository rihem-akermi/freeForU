import { AuthProvider } from "@/context/AuthContext";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import "./globals.css";

export const metadata = {
  title: "FreeForU",
  description: "Page vitrine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
          <AssistantWidget />
        </AuthProvider>
      </body>
    </html>
  );
}