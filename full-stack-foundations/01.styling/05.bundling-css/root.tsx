// 🐨 Import the cssBundleHref here
import { cssBundleHref } from "@remix-run/css-bundle";
import { type LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Scripts } from "@remix-run/react";
import faviconAssetUrl from "./assets/favicon.svg";
import { KCDShop } from "./kcdshop.tsx";
import fontStylesheetUrl from "./styles/font.css";
// 🧝‍♂️ I imported the CSS file for you. When you have it working, it'll be obvious
// ... I promise... 😈
import "./styles/global.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", type: "image/svg+xml", href: faviconAssetUrl },
    { rel: "stylesheet", href: fontStylesheetUrl },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    // 🐨 Add the cssBundleHref to the links array
    // 🦺 feel free to handle the undefined case however you like or ignore
    // the TypeScript error if you want. I'll show you how I handle it later.
    cssBundleHref ? { rel: "stylesheet", href: cssBundleHref } : null,
  ].filter(Boolean);
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Links />
      </head>
      <body>
        <p className="p-8 text-xl">Hello World</p>
        <Scripts />
        <KCDShop />
        <LiveReload />
      </body>
    </html>
  );
}
