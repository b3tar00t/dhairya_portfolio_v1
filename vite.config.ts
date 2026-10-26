import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { applyMetaToHtml, type PageMeta } from "./src/lib/meta";
import { postMeta, staticRouteMeta } from "./src/lib/routeMeta";

/**
 * After the build, write a copy of index.html per route with that route's
 * title, description and preview tags. Link-preview bots (LinkedIn, Slack,
 * X) don't run JavaScript, so they only ever see these static heads.
 * Published posts are fetched from Supabase; a post published after the
 * deploy gets the site-wide tags until the next deploy.
 */
const routeMetaPages = (env: Record<string, string>): Plugin => ({
  name: "route-meta-pages",
  apply: "build",
  async closeBundle() {
    const dist = path.resolve(__dirname, "dist");
    const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
    const pages: PageMeta[] = staticRouteMeta();

    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) {
      try {
        const res = await fetch(`${url}/rest/v1/blogs?select=slug,title,excerpt&published=eq.true`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        });
        if (res.ok) pages.push(...((await res.json()) as { slug: string; title: string; excerpt: string }[]).map(postMeta));
        else console.warn(`[route-meta-pages] posts skipped: HTTP ${res.status}`);
      } catch (e) {
        console.warn(`[route-meta-pages] posts skipped: ${(e as Error).message}`);
      }
    }

    for (const page of pages) {
      const dir = path.join(dist, page.path);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), applyMetaToHtml(html, page));
    }
    console.log(`[route-meta-pages] wrote ${pages.length} route heads`);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "VITE_") } as Record<string, string>;
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger(), routeMetaPages(env)].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
