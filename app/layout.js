import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "OK Crick App",
  description: "Cricket Tournament Scoring App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
