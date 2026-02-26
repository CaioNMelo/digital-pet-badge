import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, PawPrint } from "lucide-react";
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

const speciesLabel: Record<string, string> = {
  cachorro: "Canino",
  gato: "Felino",
  passaro: "Ave",
  roedor: "Roedor",
  outro: "Outro",
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
          <PawPrint className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-lg">Nenhum pet cadastrado ainda.</p>
          <Button variant="hero" size="lg" onClick={() => navigate("/cadastrar")}>Cadastrar Pet</Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return "Não informado";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const today = new Date().toLocaleDateString("pt-BR");

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL("image/png");
    const imgW = canvas.width;
    const imgH = canvas.height;
    const pdfW = 180;
    const pdfH = (imgH * pdfW) / imgW;
    const pdf = new jsPDF({ orientation: pdfH > pdfW ? "portrait" : "landscape", unit: "mm", format: [pdfW + 20, pdfH + 20] });
    pdf.addImage(imgData, "PNG", 10, 10, pdfW, pdfH);
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
    <div className="min-h-screen bg-muted/50">
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

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ✅ Registro concluído
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">O registro de <strong className="text-foreground">{pet.nome}</strong> foi gerado com sucesso!</p>
        </div>

        {/* RG Card - Official Brazilian RG Style */}
        <div ref={cardRef} className="mx-auto max-w-[520px]">
          <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20" style={{ background: "#f0faf7" }}>
            {/* Top Banner - Blue header like real RG */}
            <div className="px-5 py-3 text-center" style={{ background: "linear-gradient(135deg, #1a5c4c, #1a7a6a, #2196a8)" }}>
              <p className="text-[10px] tracking-[3px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>República Federativa do Brasil</p>
              <p className="text-lg font-heading font-black tracking-wide" style={{ color: "white" }}>REGISTRO GERAL — PET</p>
              <p className="text-[10px] tracking-[2px]" style={{ color: "rgba(255,255,255,0.6)" }}>DOCUMENTO DE IDENTIFICAÇÃO ANIMAL</p>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex gap-5">
                {/* Left Column - Photo + QR */}
                <div className="flex-shrink-0 space-y-3">
                  <div className="w-[110px] h-[130px] rounded-lg overflow-hidden border-2" style={{ borderColor: "#1a7a6a" }}>
                    <img src={pet.foto} alt={pet.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-center bg-background rounded-lg p-2">
                    <QRCodeSVG
                      value={`https://registrarpet.com/consulta/${pet.registroId}`}
                      size={80}
                      level="M"
                      fgColor="#1a5c4c"
                    />
                  </div>
                </div>

                {/* Right Column - Info */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Registration Number */}
                  <div className="rounded-lg px-3 py-1.5" style={{ background: "#1a7a6a" }}>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Nº de Registro</p>
                    <p className="font-mono font-bold text-sm tracking-wider" style={{ color: "white" }}>{pet.registroId}</p>
                  </div>

                  {/* Pet Name */}
                  <div className="border-b pb-1.5" style={{ borderColor: "#1a7a6a33" }}>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Nome</p>
                    <p className="font-heading font-black text-foreground text-base">{pet.nome}</p>
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <div className="border-b pb-1" style={{ borderColor: "#1a7a6a22" }}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Espécie</p>
                      <p className="text-xs font-semibold text-foreground">{speciesLabel[pet.especie] || pet.especie}</p>
                    </div>
                    <div className="border-b pb-1" style={{ borderColor: "#1a7a6a22" }}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Raça</p>
                      <p className="text-xs font-semibold text-foreground">{pet.raca || "SRD"}</p>
                    </div>
                    <div className="border-b pb-1" style={{ borderColor: "#1a7a6a22" }}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Sexo</p>
                      <p className="text-xs font-semibold text-foreground capitalize">{pet.sexo === "macho" ? "Macho" : "Fêmea"}</p>
                    </div>
                    <div className="border-b pb-1" style={{ borderColor: "#1a7a6a22" }}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Nascimento</p>
                      <p className="text-xs font-semibold text-foreground">{formatDate(pet.dataNascimento)}</p>
                    </div>
                    <div className="col-span-2 border-b pb-1" style={{ borderColor: "#1a7a6a22" }}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Cor Predominante</p>
                      <p className="text-xs font-semibold text-foreground">{pet.corPredominante || "Não informada"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Section */}
              <div className="mt-4 pt-3 border-t-2" style={{ borderColor: "#1a7a6a33" }}>
                <p className="text-[9px] uppercase tracking-[2px] font-bold mb-2" style={{ color: "#1a7a6a" }}>Dados do Tutor Responsável</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Nome</p>
                    <p className="text-xs font-semibold text-foreground">{pet.nomeTutor}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">CPF</p>
                    <p className="text-xs font-semibold text-foreground">{pet.cpfTutor}</p>
                  </div>
                  {pet.telefone && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Telefone</p>
                      <p className="text-xs font-semibold text-foreground">{pet.telefone}</p>
                    </div>
                  )}
                  {pet.endereco && (
                    <div className={pet.telefone ? "" : "col-span-2"}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Endereço</p>
                      <p className="text-xs font-semibold text-foreground truncate">{pet.endereco}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-2 flex items-center justify-between border-t" style={{ borderColor: "#1a7a6a22" }}>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Data de emissão</p>
                  <p className="text-[10px] font-semibold text-foreground">{today}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-muted-foreground">registrarpet.com</p>
                  <p className="text-[8px] font-bold" style={{ color: "#1a7a6a" }}>🐾 RegistrarPet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10 max-w-[520px] mx-auto">
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

        <div className="text-center mt-6">
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/cadastrar")}>
            + Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RGPage;
