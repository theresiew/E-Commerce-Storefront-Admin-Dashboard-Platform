import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <Navbar />
      <main className="page-frame">{children}</main>
      <Footer />
    </div>
  );
}
