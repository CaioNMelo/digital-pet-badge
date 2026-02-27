import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, PawPrint } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

interface PetData {
  nome: string; foto: string; especie: string; raca: string; sexo: string;
  dataNascimento: string; corPredominante: string; porte: string; castrado: string;
  microchip: string; nomeTutor: string; nomeTutor2: string; cpfTutor: string;
  telefone: string; email: string; endereco: string; cidade: string; estado: string;
  registroId: string;
}

const speciesLabel: Record<string, string> = {
  cachorro: "Canino", gato: "Felino", passaro: "Ave", roedor: "Roedor", outro: "Outro",
};

// Texto vertical via rotate — sem writing-mode (compatível com html-to-image)
const VText = ({ children, w, h, size = 9, weight = 700, rotate = -90, spacing = 0 }: {
  children: string; w: number; h: number; size?: number; weight?: number; rotate?: number; spacing?: number;
}) => (
  <div style={{ width: w, height: h, flexShrink: 0, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ position: "absolute", whiteSpace: "nowrap", fontSize: size, fontWeight: weight, color: "#1a1a1a", letterSpacing: spacing, textTransform: "uppercase", fontFamily: "Arial, sans-serif", width: h, textAlign: "center", transform: `rotate(${rotate}deg)`, transformOrigin: "center center", lineHeight: 1 }}>
      {children}
    </span>
  </div>
);

// FieldCol: coluna vertical de campo para o RG.
// Usa flexDirection:ROW (label | divisória vertical | valor) antes de rotacionar -90°.
// Depois da rotação: label fica no extremo visível de um lado, valor no outro.
const FieldCol = ({ label, value, colH, flexVal = 1 }: {
  label: string; value: string; colH: number; flexVal?: number;
}) => (
  <div style={{
    flex: flexVal,
    height: colH,
    overflow: "hidden",
    borderRight: "1px solid rgba(74,104,88,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}>
    {/* Largura = colH-12 → após rotate(-90°) vira altura visual, preenchendo o strip */}
    <div style={{
      width: colH - 12,
      flexShrink: 0,
      transform: "rotate(-90deg)",
      transformOrigin: "center center",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    }}>
      {/* Label — posição esquerda no row → extremo inferior do strip após rotação */}
      <div style={{ flexShrink: 0, paddingRight: 5 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, color: "#1a1a1a",
          textTransform: "uppercase", fontFamily: "Arial, sans-serif",
          whiteSpace: "nowrap", lineHeight: 1, letterSpacing: 0.5,
          display: "block",
        }}>
          {label}
        </span>
      </div>
      {/* Divisória vertical → após rotação fica horizontal separando label do valor */}
      <div style={{ width: 1.5, height: 22, backgroundColor: "#444", flexShrink: 0 }} />
      {/* Valor — posição direita no row → extremo superior do strip após rotação */}
      <div style={{ flex: 1, paddingLeft: 5, overflow: "hidden" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#111",
          textTransform: "uppercase", fontFamily: "Arial, sans-serif",
          whiteSpace: "nowrap", lineHeight: 1,
          display: "block", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {value || "\u00A0"}
        </span>
      </div>
    </div>
  </div>
);

const RGPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  // Inicializa o scale imediatamente (lazy) para evitar flash de scroll no primeiro render
  const [scale, setScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const avail = window.innerWidth - 32;
    return avail < 960 ? avail / 960 : 1;
  });
  const pet = (location.state as { pet: PetData })?.pet;

  useEffect(() => {
    const update = () => {
      const avail = window.innerWidth - 32;
      setScale(avail < 960 ? avail / 960 : 1);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

  const fmt = (d: string) => { if (!d) return ""; const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; };
  const today = new Date().toLocaleDateString("pt-BR");
  const naturalidade = pet.cidade
    ? pet.estado ? `${pet.cidade} - ${pet.estado}` : pet.cidade
    : pet.endereco ? pet.endereco.split(" - ").slice(-1)[0].trim() : "";

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const imgData = await toJpeg(cardRef.current, { quality: 0.97, pixelRatio: 3, backgroundColor: "#ffffff", fetchRequestInit: { cache: "no-cache" } });
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const printW = 281, printH = printW * (600 / 960);
    pdf.addImage(imgData, "JPEG", 8, (210 - printH) / 2, printW, printH);
    pdf.save(`RG_${pet.nome}_${pet.registroId}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: `RG - ${pet.nome}`, text: `RG Digital de ${pet.nome}!` });
  };

  const CW = 960, CH = 600, HH = CH - 24;
  // Dois grupos de campos — cada grupo ocupa metade da altura do lado direito
  const HALF = Math.floor((HH - 2) / 2);

  const grupo1 = [
    { label: "NOME", value: pet.nome, flex: 2 },
    { label: "NASCIMENTO", value: fmt(pet.dataNascimento), flex: 1.1 },
    { label: "NATURALIDADE", value: naturalidade, flex: 1.2 },
    { label: "SEXO", value: pet.sexo, flex: 0.85 },
    { label: "CASTRADO", value: pet.castrado || "A VERIFICAR", flex: 1.1 },
    { label: "TUTORES", value: pet.nomeTutor, flex: 1.2 },
  ];
  const grupo2 = [
    { label: "No REGISTRO", value: pet.registroId, flex: 1.8 },
    { label: "EXPEDICAO", value: today, flex: 1.1 },
    { label: "ESPECIE", value: speciesLabel[pet.especie] || pet.especie, flex: 1 },
    { label: "RACA", value: pet.raca || "SRD", flex: 1 },
    { label: "PORTE", value: pet.porte || "—", flex: 0.85 },
    { label: "PELAGEM", value: pet.corPredominante || "—", flex: 1 },
  ];

  return (
    <div className="min-h-screen bg-muted/50 overflow-x-hidden">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 print:hidden">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold">Registrar<span className="text-primary">Pet</span></span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl overflow-x-hidden">
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">✅ Registro concluído</div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download/impressão.</p>
        </div>

        {/* Container responsivo com scale automático — overflow:hidden evita scrollbar */}
        <div className="flex justify-center w-full mb-6 overflow-hidden">
          <div style={{ width: CW * scale, height: CH * scale, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${scale})`, width: CW, height: CH }}>

              {/* CARD RG */}
              <div ref={cardRef} style={{ width: CW, height: CH, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, fontFamily: "Arial, sans-serif", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

                {/* Moldura verde escura */}
                <div style={{ position: "absolute", inset: 8, borderRadius: 6, backgroundColor: "#4a6e58", backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")` }} />

                {/* Duas metades */}
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", gap: 6, padding: 10 }}>

                  {/* METADE ESQUERDA */}
                  <div style={{ flex: 1, borderRadius: 4, backgroundColor: "#cfe8c8", display: "flex", overflow: "hidden" }}>
                    <VText w={22} h={HH} size={8} weight={650} rotate={-90} spacing={0.4}>REGISTRADO POR WWW.REGISTRAPET.PET</VText>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "12px 6px", gap: 6 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 4, paddingBottom: 6, flexShrink: 0 }}>
                        <VText w={32} h={HH - 50} size={17} weight={700} rotate={-90} spacing={0}>REGISTRO DOS ANIMAIS DO BRASIL</VText>
                        <VText w={14} h={HH - 50} size={7} weight={700} rotate={-90} spacing={0.3}>ATRAVES DO SITE WWW.REGISTRAPET.PET</VText>
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", padding: "0 8px" }}>
                        {/* Foto */}
                        <div style={{ width: 170, height: 170, backgroundColor: "#fff", border: "1px solid #aaa", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {pet.foto ? <img src={pet.foto} alt={pet.nome} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <PawPrint style={{ width: 60, height: 60, color: "#ccc" }} />}
                        </div>
                        {/* QR Code */}
                        <div style={{ width: 170, height: 170, backgroundColor: "#fff", border: "1px solid #aaa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.06 }}>
                            <PawPrint style={{ width: 120, height: 120, color: "#000" }} />
                          </div>
                          <QRCodeSVG value={`https://registrarpet.com/consulta/${pet.registroId}`} size={152} level="M" fgColor="#1a1a1a" style={{ position: "relative", zIndex: 1 }} />
                        </div>
                      </div>
                      <VText w={20} h={HH} size={9.5} weight={700} rotate={-90} spacing={1}>• ASSINATURA</VText>
                    </div>
                  </div>

                  {/* DIVISÓRIA */}
                  <div style={{ width: 8, display: "flex", alignItems: "stretch", justifyContent: "center", opacity: 0.3 }}>
                    <div style={{ width: 1, borderLeft: "2px dashed rgba(0,0,0,0.5)", height: "100%" }} />
                  </div>

                  {/* METADE DIREITA */}
                  <div style={{ flex: 1, borderRadius: 4, backgroundColor: "#cfe8c8", display: "flex", overflow: "hidden" }}>
                    <div style={{ borderRight: "1px solid rgba(74,110,88,0.25)", flexShrink: 0 }}>
                      <VText w={26} h={HH} size={9} weight={700} rotate={-90} spacing={1.5}>CARTEIRA DE IDENTIDADE ANIMAL</VText>
                    </div>

                    {/* Dois grupos de colunas verticais empilhados */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                      {/* Grupo 1 — linha superior */}
                      <div style={{ height: HALF, display: "flex", flexDirection: "row", alignItems: "stretch", borderBottom: "2px solid rgba(74,110,88,0.4)" }}>
                        {grupo1.map(c => <FieldCol key={c.label} label={c.label} value={c.value} colH={HALF} flexVal={c.flex} />)}
                      </div>

                      {/* Grupo 2 — linha inferior */}
                      <div style={{ height: HALF, display: "flex", flexDirection: "row", alignItems: "stretch" }}>
                        {grupo2.map(c => <FieldCol key={c.label} label={c.label} value={c.value} colH={HALF} flexVal={c.flex} />)}
                      </div>

                    </div>

                    <VText w={22} h={HH} size={8} weight={700} rotate={90} spacing={0.4}>REGISTRADO POR WWW.REGISTRAPET.PET</VText>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-[600px] mx-auto print:hidden">
          <Button variant="hero" size="lg" className="flex-1 h-14" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5 mr-1" />Baixar RG em PDF (A4)
          </Button>
          {navigator.share && (
            <Button variant="outline" size="lg" className="h-14" onClick={handleShare}>
              <Share2 className="w-5 h-5 mr-1" />Compartilhar
            </Button>
          )}
        </div>

        <div className="text-center mt-6 print:hidden">
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/cadastrar")}>+ Cadastrar outro pet</Button>
        </div>
      </main>
    </div>
  );
};

export default RGPage;
