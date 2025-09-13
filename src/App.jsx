import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ProjectDescription from "./pages/ProjectDescription";
import Home from "./pages/Home";
import ModulesDescription from "./pages/ModulesDescription";
import Dojo from "./pages/Dojo";
import Battlefield from "./pages/Battlefield";
import SinglePlayerResults from "./pages/SinglePlayerResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/project-description" element={<ProjectDescription />} />
          <Route path="/home" element={<Home />} />
          <Route path="/modules" element={<ModulesDescription />} />
          <Route path="/dojo/:moduleId" element={<Dojo />} />
          <Route path="/battlefield" element={<Battlefield />} />
          <Route path="/single-player-results" element={<SinglePlayerResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;