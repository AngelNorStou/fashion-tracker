import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fashion Tracker",
  description: "Manage your wardrobe and create outfits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
    <link
            rel="stylesheet"
            href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css"
     />
     </head>
      <body>
        <Navbar />

        {children}
<footer className="border-t border-[#E3DACB] bg-[#FFFDF9] py-6"><p className="text-center text-xs text-[#A69C8C]">Icons by <a href="https://www.flaticon.com/uicons" className="text-[#8A8172] underline decoration-[#D8CFC1] underline-offset-2 hover:text-[#C1592F]">Uicons</a></p></footer>
      </body>
    </html>
  );
}