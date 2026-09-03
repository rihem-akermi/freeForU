import "./globals.css";

export const metadata = {
  title: "🏃‍♀️‍➡️ FreeForU",
  description: "Page vitrine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
