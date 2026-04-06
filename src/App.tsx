import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Checklist from "@/pages/Checklist";
import Treino from "@/pages/Treino";
import Sono from "@/pages/Sono";
import Perfil from "@/pages/Perfil";
import Config from "@/pages/Config";
import Tarefas from "@/pages/Tarefas";
import Biblia from "@/pages/Biblia";
import Notas from "@/pages/Notas";
import Historico from "@/pages/Historico";
import Performance from "@/pages/Performance";
import ModoFoco from "@/pages/ModoFoco";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rotina" element={<Checklist />} />
              <Route path="/treino" element={<Treino />} />
              <Route path="/sono" element={<Sono />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/config" element={<Config />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/biblia" element={<Biblia />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/performance" element={<Performance />} />
            </Route>
            <Route path="/foco" element={<ModoFoco />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
