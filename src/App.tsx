import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CadastrarPage from "./pages/CadastrarPage";
import RGPage from "./pages/RGPage";
import CertidaoPage from "./pages/CertidaoPage";
import DocumentosPage from "./pages/DocumentosPage";
import VacinacaoPage from "./pages/VacinacaoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastrar" element={<CadastrarPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/rg" element={<RGPage />} />
          <Route path="/certidao" element={<CertidaoPage />} />
          <Route path="/vacinacao" element={<VacinacaoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
