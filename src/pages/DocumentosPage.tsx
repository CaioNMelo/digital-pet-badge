import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, FileText, CreditCard, Syringe } from "lucide-react";

interface PetData {
  nome: string; foto: string; especie: string; raca: string; sexo: string;
  dataNascimento: string; corPredominante: string; porte: string; castrado: string;
  microchip: string; nomeTutor: string; nomeTutor2: string; cpfTutor: string;
  telefone: string; email: string; endereco: string; cidade: string; estado: string;
  registroId: string;
}

const DocumentosPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pet = (location.state as { pet: PetData })?.pet;

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <PawPrint className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-lg">Nenhum pet cadastrado ainda.</p>
          <Button variant="hero" size="lg" onClick={() => navigate("/cadastrar")}>Cadastrar Pet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <header className="bg-background/90 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold">Registrar<span className="text-primary">Pet</span></span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ✅ Registro concluído com sucesso!
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Documentos de {pet.nome}
          </h1>
          <p className="text-muted-foreground">
            Escolha qual documento você deseja visualizar e baixar.
          </p>
        </div>

        {/* Pet preview */}
        <div className="flex items-center gap-4 bg-card rounded-2xl p-5 border border-border/60 shadow-sm mb-8 max-w-md mx-auto">
          {pet.foto ? (
            <img src={pet.foto} alt={pet.nome} className="w-16 h-16 rounded-xl object-cover border-2 border-primary/30" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-primary/50" />
            </div>
          )}
          <div>
            <p className="font-heading font-bold text-lg text-foreground">{pet.nome}</p>
            <p className="text-sm text-muted-foreground">{pet.especie} • {pet.raca || "SRD"} • {pet.sexo}</p>
            <p className="text-xs text-muted-foreground font-mono">{pet.registroId}</p>
          </div>
        </div>

        {/* Document cards */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/rg", { state: { pet } })}
            className="group bg-card rounded-2xl p-6 border-2 border-border/60 shadow-sm hover:border-primary hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">RG Digital</h3>
            <p className="text-sm text-muted-foreground">Carteira de identidade animal.</p>
          </button>

          <button
            onClick={() => navigate("/certidao", { state: { pet } })}
            className="group bg-card rounded-2xl p-6 border-2 border-border/60 shadow-sm hover:border-primary hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">Certidão de Nascimento</h3>
            <p className="text-sm text-muted-foreground">Registro oficial com todos os dados.</p>
          </button>

          <button
            onClick={() => navigate("/vacinacao", { state: { pet } })}
            className="group bg-card rounded-2xl p-6 border-2 border-border/60 shadow-sm hover:border-primary hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <Syringe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">Carteira de Vacinação</h3>
            <p className="text-sm text-muted-foreground">Controle de imunização animal.</p>
          </button>
        </div>

        <div className="text-center mt-10">
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/cadastrar")}>
            + Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DocumentosPage;
