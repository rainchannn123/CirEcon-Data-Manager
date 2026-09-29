import "./styles.css";

export const metadata = {
  title: "CirEcon Data Manager",
  description: "Private MongoDB visualization and export console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
