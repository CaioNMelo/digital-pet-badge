import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import VerificarEmailPage from "./pages/VerificarEmailPage";
import CadastrarPage from "./pages/CadastrarPage";
import RGPage from "./pages/RGPage";
import CertidaoPage from "./pages/CertidaoPage";
import DocumentosPage from "./pages/DocumentosPage";
import VacinacaoPage from "./pages/VacinacaoPage";
import ProtectedRoute from "./components/ProtectedRoute";
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
          <Route path="/verificar" element={<VerificarEmailPage />} />
          <Route path="/cadastrar" element={<ProtectedRoute><CadastrarPage /></ProtectedRoute>} />
          <Route path="/documentos" element={<ProtectedRoute><DocumentosPage /></ProtectedRoute>} />
          <Route path="/rg" element={<ProtectedRoute><RGPage /></ProtectedRoute>} />
          <Route path="/certidao" element={<ProtectedRoute><CertidaoPage /></ProtectedRoute>} />
          <Route path="/vacinacao" element={<ProtectedRoute><VacinacaoPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
