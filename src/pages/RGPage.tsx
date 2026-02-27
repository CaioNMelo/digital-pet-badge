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

const VText = ({ children, w, h, size = 9, weight = 700, rotate = -90, spacing = 0 }: {
  children: string; w: number; h: number; size?: number; weight?: number; rotate?: number; spacing?: number;
}) => (
  <div style={{ width: w, height: h, flexShrink: 0, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ position: "absolute", whiteSpace: "nowrap", fontSize: size, fontWeight: weight, color: "#1a1a1a", letterSpacing: spacing, textTransform: "uppercase", fontFamily: "Arial, sans-serif", width: h, textAlign: "center", transform: `rotate(${rotate}deg)`, transformOrigin: "center center", lineHeight: 1 }}>
      {children}
    </span>
  </div>
);

const FieldCol = ({ label, value, colH, flexVal = 1 }: {
  label: string; value: string; colH: number; flexVal?: number;
}) => (
  <div style={{ flex: flexVal, height: colH, position: "relative", overflow: "hidden", borderRight: "1px solid rgba(74,104,88,0.22)" }}>
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      width: colH - 20,
      transform: "translate(-50%, -50%) rotate(-90deg)",
      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "0 4px",
    }}>
      <span style={{ fontSize: 7, fontWeight: 700, color: "#2a2a2a", textTransform: "uppercase", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", lineHeight: 1, letterSpacing: 0.3 }}>
        {label}
      </span>
      <div style={{ width: "100%", height: 1.5, backgroundColor: "#444", flexShrink: 0 }} />
      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#111", textTransform: "uppercase", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", lineHeight: 1, overflow: "hidden", maxWidth: "100%", textOverflow: "ellipsis" }}>
        {value || "\u00A0"}
      </span>
    </div>
  </div>
);

const RGPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const pet = (location.state as { pet: PetData })?.pet;

  useEffect(() => {
    const update = () => {
      const avail = window.innerWidth - 32;
      setScale(avail < 960 ? avail / 960 : 1);
    };
    update();
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
  const HALF = Math.floor((HH - 2) / 2);
  const IMG_SIZE = 168; // Levemente menor para aumentar o respiro vertical

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
    <div className="min-h-screen bg-muted/50">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 print:hidden">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold">Registrar<span className="text-primary">Pet</span></span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">✅ Registro concluído</div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download/impressão.</p>
        </div>

        <div className="flex justify-center w-full mb-6">
          <div style={{ width: CW * scale, height: CH * scale, position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${scale})`, width: CW, height: CH }}>

              {/* CARD RG */}
              <div ref={cardRef} style={{ width: CW, height: CH, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, fontFamily: "Arial, sans-serif", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

                {/* Moldura verde escura */}
                <div style={{ position: "absolute", inset: 12, borderRadius: 6, backgroundColor: "#4a6e58", backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")` }} />

                {/* Duas metades */}
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", gap: 6, padding: 10 }}>

                  {/* METADE ESQUERDA */}
                  <div style={{ flex: 1, borderRadius: 4, backgroundColor: "#cfe8c8", display: "flex", overflow: "hidden" }}>

                    {/* Faixa lateral esquerda — "REGISTRADO POR..." como borda fina */}
                    <VText w={20} h={HH} size={7.5} weight={700} rotate={-90} spacing={0.4}>REGISTRADO POR WWW.REGISTRAPET.PET</VText>

                    {/* Área interna com padding generoso para tirar o efeito de 'colado na parede' */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "stretch", padding: "18px 12px 18px 8px", gap: 0, overflow: "hidden" }}>

                      {/* Bloco de títulos verticais — margin-right maior para empurrar a foto ao centro */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        borderRight: "1.5px solid rgba(74,110,88,0.25)",
                        paddingRight: 8, marginRight: 20, gap: 5, flexShrink: 0,
                      }}>
                        <VText w={36} h={HH - 80} size={16} weight={800} rotate={-90} spacing={0.2}>REGISTRO DOS ANIMAIS DO BRASIL</VText>
                        <VText w={14} h={HH - 80} size={7} weight={700} rotate={-90} spacing={0.5}>ATRAVES DO SITE WWW.REGISTRAPET.PET</VText>
                      </div>

                      {/* Coluna central: foto + assinatura + QR — agora com mais respiro */}
                      <div style={{
                        flex: 1,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 12,
                        padding: "0 10px",
                      }}>

                        {/* Foto */}
                        <div style={{
                          width: IMG_SIZE, height: IMG_SIZE,
                          backgroundColor: "#fff",
                          border: "1.5px solid rgba(74,110,88,0.6)",
                          borderRadius: 4,
                          overflow: "hidden", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                        }}>
                          {pet.foto
                            ? <img src={pet.foto} alt={pet.nome} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <PawPrint style={{ width: 60, height: 60, color: "#aaa" }} />
                          }
                        </div>

                        {/* Linha de assinatura */}
                        <div style={{ width: IMG_SIZE, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 4 }}>
                          <div style={{ width: "100%", height: 1.5, backgroundColor: "rgba(26,26,26,0.4)" }} />
                          <span style={{ fontSize: 8, fontWeight: 700, color: "#333", textTransform: "uppercase", fontFamily: "Arial, sans-serif", letterSpacing: 1.5 }}>• ASSINATURA DO TUTOR</span>
                        </div>

                        {/* QR Code */}
                        <div style={{
                          width: IMG_SIZE, height: IMG_SIZE,
                          backgroundColor: "#fff",
                          border: "1.5px solid rgba(74,110,88,0.6)",
                          borderRadius: 4,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, position: "relative", overflow: "hidden",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                        }}>
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.05 }}>
                            <PawPrint style={{ width: 115, height: 115, color: "#000" }} />
                          </div>
                          <QRCodeSVG
                            value={`https://registrarpet.com/consulta/${pet.registroId}`}
                            size={IMG_SIZE - 24}
                            level="M"
                            fgColor="#1a1a1a"
                            style={{ position: "relative", zIndex: 1 }}
                          />
                        </div>

                      </div>
                    </div>

                    {/* Faixa lateral direita da metade esquerda */}
                    <VText w={20} h={HH} size={7.5} weight={700} rotate={90} spacing={0.4}>REGISTRADO POR WWW.REGISTRAPET.PET</VText>
                  </div>

                  {/* DIVISÓRIA */}
                  <div style={{ width: 8, display: "flex", alignItems: "stretch", justifyContent: "center", opacity: 0.3 }}>
                    <div style={{ width: 1, borderLeft: "2px dashed rgba(0,0,0,0.5)", height: "100%" }} />
                  </div>

                  {/* METADE DIREITA (Já estruturada, mantida conforme original) */}
                  <div style={{ flex: 1, borderRadius: 4, backgroundColor: "#cfe8c8", display: "flex", overflow: "hidden" }}>
                    <div style={{ borderRight: "1px solid rgba(74,110,88,0.25)", flexShrink: 0 }}>
                      <VText w={26} h={HH} size={9} weight={700} rotate={-90} spacing={1.5}>CARTEIRA DE IDENTIDADE ANIMAL</VText>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <div style={{ height: HALF, display: "flex", flexDirection: "row", alignItems: "stretch", borderBottom: "2px solid rgba(74,110,88,0.4)" }}>
                        {grupo1.map(c => <FieldCol key={c.label} label={c.label} value={c.value} colH={HALF} flexVal={c.flex} />)}
                      </div>
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