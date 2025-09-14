import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ProjectDescription from "./pages/ProjectDescription";
import Home from "./pages/Home";
import ModulesDescription from "./pages/ModulesDescription";
import Module1Dojo from "./pages/Module1Dojo";
import Battlefield from "./pages/Battlefield";
import SinglePlayerResults from "./pages/SinglePlayerResults";
import NotFound from "./pages/NotFound";
import Module2Dojo from "./pages/Module2Dojo";
import MultiplayerDojo from "./pages/MultiplayerDojo";
import MultiplayerResults from "./pages/MultiPlayerResults";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route
                        path="/project-description"
                        element={<ProjectDescription />}
                    />
                    <Route path="/home" element={<Home />} />
                    <Route path="/modules" element={<ModulesDescription />} />
                    <Route path="/dojo/1" element={<Module1Dojo />} />
                    <Route path="/dojo/2" element={<Module2Dojo />} />
                    <Route
                        path="/multiplayer-dojo"
                        element={<MultiplayerDojo />}
                    />
                    <Route path="/battlefield" element={<Battlefield />} />
                    <Route
                        path="/single-player-results"
                        element={<SinglePlayerResults />}
                    />
                    <Route
                        path="/multiplayer-results"
                        element={<MultiplayerResults />}
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
