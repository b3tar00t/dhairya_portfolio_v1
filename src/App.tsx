import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { track } from "./lib/analytics";
import { ContentProvider } from "./content/ContentProvider";
import Index from "./pages/Index";
import CommandPalette from "./components/palette/CommandPalette";
import { useResumeUrl } from "./hooks/useResumeUrl";

// Everything except the landing page loads on demand.
const Admin = lazy(() => import("./pages/Admin"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const Brief = lazy(() => import("./pages/Brief"));
const Vault = lazy(() => import("./pages/Vault"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Palette = () => <CommandPalette resumeUrl={useResumeUrl()} />;

// One anonymous page view per route change.
const RouteTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => track('page_view'), [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ContentProvider>
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Palette />
          <RouteTracker />
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/writeups" element={<Blog initialKind="writeup" />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/brief" element={<Brief />} />
            <Route path="/vault" element={<Vault />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
    </ContentProvider>
  </QueryClientProvider>
);

export default App;
