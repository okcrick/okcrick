import "./globals.css";
import ErrorCatcher from "../components/ErrorCatcher";

export const metadata = {
  title: "OKCrick",
  description: "Live scoring powered by Firebase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorCatcher>
          {children}
        </ErrorCatcher>
      </body>
    </html>
  );
}
