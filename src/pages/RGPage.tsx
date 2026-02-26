import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PetData {
  nome: string;
  foto: string;
  especie: string;
  raca: string;
  sexo: string;
  dataNascimento: string;
  corPredominante: string;
  nomeTutor: string;
  cpfTutor: string;
  telefone: string;
  endereco: string;
  registroId: string;
}

const speciesEmoji: Record<string, string> = {
  cachorro: "🐶",
  gato: "🐱",
  passaro: "🐦",
  roedor: "🐹",
  outro: "🐾",
};

const RGPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const pet = (location.state as { pet: PetData })?.pet;

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nenhum pet cadastrado ainda.</p>
          <Button variant="hero" onClick={() => navigate("/cadastrar")}>Cadastrar Pet</Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return "—";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const maskCPF = (cpf: string) => {
    if (cpf.length < 14) return cpf;
    return `***.***.${cpf.slice(8)}`;
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [100, 150] });
    pdf.addImage(imgData, "PNG", 0, 0, 150, 100);
    pdf.save(`RG_${pet.nome}_${pet.registroId}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `RG Digital - ${pet.nome}`,
        text: `Confira o RG Digital de ${pet.nome}! Registro: ${pet.registroId}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold">
              Registrar<span className="text-primary">Pet</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet 🎉</h1>
          <p className="text-muted-foreground">O registro digital de {pet.nome} foi gerado com sucesso!</p>
        </div>

        {/* RG Card */}
        <div ref={cardRef} className="mx-auto max-w-lg">
          <div className="rounded-2xl overflow-hidden shadow-lg border" style={{ background: "linear-gradient(135deg, hsl(168 55% 42%), hsl(200 70% 50%))" }}>
            {/* Card Header */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "white" }}>REGISTRO DIGITAL</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>RegistrarPet</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>Nº Registro</p>
                <p className="text-xs font-mono font-bold" style={{ color: "white" }}>{pet.registroId}</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="bg-card mx-2 mb-2 rounded-xl p-5">
              <div className="flex gap-5">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-primary/20">
                    <img src={pet.foto} alt={pet.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-2 flex justify-center">
                    <QRCodeSVG value={`registrarpet://pet/${pet.registroId}`} size={60} level="M" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-heading font-bold text-foreground text-lg leading-tight">{pet.nome}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <p className="text-xs text-muted-foreground">Espécie</p>
                      <p className="text-sm font-medium text-foreground">{speciesEmoji[pet.especie] || "🐾"} {pet.especie}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Raça</p>
                      <p className="text-sm font-medium text-foreground">{pet.raca || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sexo</p>
                      <p className="text-sm font-medium text-foreground capitalize">{pet.sexo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nascimento</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(pet.dataNascimento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cor</p>
                      <p className="text-sm font-medium text-foreground">{pet.corPredominante || "—"}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Tutor</p>
                    <p className="text-sm font-medium text-foreground">{pet.nomeTutor}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">CPF: {maskCPF(pet.cpfTutor)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-lg mx-auto">
          <Button variant="hero" size="lg" className="flex-1" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5" />
            Baixar RG do Pet em PDF
          </Button>
          {navigator.share && (
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
              Compartilhar
            </Button>
          )}
        </div>

        <div className="text-center mt-8">
          <Button variant="secondary" onClick={() => navigate("/cadastrar")}>
            Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RGPage;
