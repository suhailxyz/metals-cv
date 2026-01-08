import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DataPrivacy from "./pages/DataPrivacy";

const queryClient = new QueryClient();

// Handle GitHub Pages 404.html redirect
// When GitHub Pages serves 404.html, it redirects to index.html with a query parameter
// This component processes that redirect and navigates to the correct route
const RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('/');
      if (redirect) {
        // Decode the path (replace ~and~ with & for query strings)
        const path = redirect.replace(/~and~/g, '&');
        navigate(path, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="stack-tracker-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <RedirectHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/data-privacy" element={<DataPrivacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
