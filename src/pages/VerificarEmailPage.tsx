import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const VerificarEmailPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.toLowerCase().trim();

    if (!trimmed || !trimmed.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("approved_purchases")
        .select("email, status")
        .eq("email", trimmed)
        .eq("status", "approved")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Store verified email in sessionStorage
        sessionStorage.setItem("verified_email", trimmed);
        toast({
          title: "Acesso liberado! 🎉",
          description: "Compra verificada com sucesso. Bem-vindo(a)!",
        });
        navigate("/cadastrar");
      } else {
        toast({
          title: "Acesso não autorizado",
          description: "Este email não possui uma compra aprovada. Verifique se usou o mesmo email da compra.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast({
        title: "Erro",
        description: "Não foi possível verificar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute top-20 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <PawPrint className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Registrar<span className="text-primary">Pet</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Acesso exclusivo para compradores
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Insira o email usado na compra pela <strong className="text-foreground">Lowify</strong> para liberar o acesso.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email da compra
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Verificar acesso <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ainda não comprou?{" "}
            <a
              href="https://pay.lowify.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Clique aqui para adquirir
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificarEmailPage;
