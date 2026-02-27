import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, PawPrint } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

interface PetData {
  nome: string;
  foto: string;
  especie: string;
  raca: string;
  sexo: string;
  dataNascimento: string;
  corPredominante: string;
  porte: string;
  castrado: string;
  microchip: string;
  nomeTutor: string;
  nomeTutor2: string;
  cpfTutor: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  registroId: string;
}

const speciesLabel: Record<string, string> = {
  cachorro: "Canino",
  gato: "Felino",
  passaro: "Ave",
  roedor: "Roedor",
  outro: "Outro",
};

// ─── VText: texto rotacionado via transform:rotate (sem writing-mode) ────
const VText = ({
  children,
  w,
  h,
  size = 10,
  weight = 700,
  rotate = -90,
  color = "#1a1a1a",
  spacing = 0,
}: {
  children: string;
  w: number;
  h: number;
  size?: number;
  weight?: number;
  rotate?: number;
  color?: string;
  spacing?: number;
}) => (
  <div
    style={{
      width: w,
      height: h,
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <span
      style={{
        position: "absolute",
        whiteSpace: "nowrap",
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: spacing,
        textTransform: "uppercase",
        fontFamily: "Arial, Helvetica, sans-serif",
        width: h,
        textAlign: "center",
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "center center",
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  </div>
);

// ─── Field: linha label + underline + valor (horizontal) ─────────────────
const Field = ({
  label,
  value,
  flex = 1,
  vSize = 11,
}: {
  label: string;
  value: string;
  flex?: number;
  vSize?: number;
}) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 5, flex, minWidth: 0 }}>
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: "#111",
        whiteSpace: "nowrap",
        flexShrink: 0,
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1,
        paddingBottom: 2,
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span
      style={{
        flex: 1,
        borderBottom: "1.5px solid #444",
        fontSize: vSize,
        fontWeight: 700,
        color: "#111",
        textTransform: "uppercase",
        fontFamily: "Arial, Helvetica, sans-serif",
        paddingBottom: 1,
        lineHeight: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value || "\u00A0"}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
const RGPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const pet = (location.state as { pet: PetData })?.pet;

  // Responsividade: escala o card para caber na tela sem scroll horizontal
  useEffect(() => {
    const handleResize = () => {
      const CW = 960;
      const padding = 32; // px de margin nas laterais
      const availW = window.innerWidth - padding;
      setScale(availW < CW ? availW / CW : 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <PawPrint className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-lg">Nenhum pet cadastrado ainda.</p>
          <Button variant="hero" size="lg" onClick={() => navigate("/cadastrar")}>
            Cadastrar Pet
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const today = new Date().toLocaleDateString("pt-BR");

  // Naturalidade: usa cidade+estado se disponíveis, senão faz parse do endereço
  const naturalidade = pet.cidade
    ? pet.estado
      ? `${pet.cidade} - ${pet.estado}`
      : pet.cidade
    : pet.endereco
      ? pet.endereco.includes(" - ")
        ? pet.endereco.split(" - ").slice(-1)[0].trim()
        : pet.endereco
      : "";

  // ── PDF download via html-to-image (respeita transform:rotate nativamente) ──
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const imgData = await toJpeg(cardRef.current, {
      quality: 0.97,
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      fetchRequestInit: { cache: "no-cache" },
      skipFonts: false,
    });
    const pdfW = 297, pdfH = 210;
    const CW = 960, CH = 600;
    const printW = pdfW - 16;
    const printH = printW * (CH / CW);
    const x = 8, y = printH < pdfH ? (pdfH - printH) / 2 : 4;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(imgData, "JPEG", x, y, printW, printH);
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

  // Dimensões fixas do card (proporção A4 paisagem)
  const CW = 960;
  const CH = 600;
  const HH = CH - 24;

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 print:hidden">
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

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Título */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ✅ Registro concluído
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">
            Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download/impressão.
          </p>
        </div>

        {/* ── Container Responsivo ─────────────────────────────────────── */}
        {/* O wrapper tem as dimensões escaladas para não deixar espaço em branco */}
        <div className="flex justify-center w-full mb-6">
          <div
            style={{
              width: CW * scale,
              height: CH * scale,
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* Elemento que recebe o scale — o cardRef aponta para o filho sem escala */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                width: CW,
                height: CH,
              }}
            >
              {/* ══════════ CARD RG ══════════ */}
              <div
                ref={cardRef}
                style={{
                  width: CW,
                  height: CH,
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  position: "relative",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
              >
                {/* Moldura verde escura com padrão de patinhas */}
                <div
                  style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: 6,
                    backgroundColor: "#4a6e58",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Duas metades */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    gap: 6,
                    padding: 10,
                  }}
                >
                  {/* ══════════ METADE ESQUERDA ══════════ */}
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 4,
                      backgroundColor: "#cfe8c8",
                      display: "flex",
                      overflow: "hidden",
                    }}
                  >
                    {/* Borda esq */}
                    <VText w={22} h={HH} size={8} weight={700} rotate={-90} spacing={0.4}>
                      REGISTRADO POR WWW.REGISTRAPET.PET
                    </VText>

                    {/* Conteúdo esquerdo */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 6px",
                        gap: 6,
                      }}
                    >
                      {/* Títulos verticais */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: "100%",
                          gap: 4,
                          paddingBottom: 6,
                          flexShrink: 0,
                        }}
                      >
                        <VText w={32} h={HH - 50} size={17} weight={900} rotate={-90} spacing={0}>
                          REGISTRO DOS ANIMAIS DO BRASIL
                        </VText>
                        <VText w={14} h={HH - 50} size={7} weight={700} rotate={-90} spacing={0.3}>
                          ATRAVES DO SITE WWW.REGISTRAPET.PET
                        </VText>
                      </div>

                      {/* Foto + QR Code */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "space-evenly",
                          height: "100%",
                          padding: "0 8px",
                        }}
                      >
                        {/* Foto */}
                        <div
                          style={{
                            width: 170,
                            height: 170,
                            backgroundColor: "#fff",
                            border: "1px solid #aaa",
                            overflow: "hidden",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {pet.foto ? (
                            <img
                              src={pet.foto}
                              alt={pet.nome}
                              crossOrigin="anonymous"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <PawPrint style={{ width: 60, height: 60, color: "#ccc" }} />
                          )}
                        </div>

                        {/* QR Code */}
                        <div
                          style={{
                            width: 170,
                            height: 170,
                            backgroundColor: "#fff",
                            border: "1px solid #aaa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0.06,
                            }}
                          >
                            <PawPrint style={{ width: 120, height: 120, color: "#000" }} />
                          </div>
                          <QRCodeSVG
                            value={`https://registrarpet.com/consulta/${pet.registroId}`}
                            size={152}
                            level="M"
                            fgColor="#1a1a1a"
                            style={{ position: "relative", zIndex: 1 }}
                          />
                        </div>
                      </div>

                      {/* Assinatura */}
                      <VText w={20} h={HH} size={9.5} weight={700} rotate={-90} spacing={1}>
                        • ASSINATURA
                      </VText>
                    </div>
                  </div>

                  {/* ══════════ DIVISÓRIA ══════════ */}
                  <div
                    style={{
                      width: 8,
                      display: "flex",
                      alignItems: "stretch",
                      justifyContent: "center",
                      opacity: 0.3,
                    }}
                  >
                    <div
                      style={{
                        width: 1,
                        borderLeft: "2px dashed rgba(0,0,0,0.5)",
                        height: "100%",
                      }}
                    />
                  </div>

                  {/* ══════════ METADE DIREITA ══════════ */}
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 4,
                      backgroundColor: "#cfe8c8",
                      display: "flex",
                      overflow: "hidden",
                    }}
                  >
                    {/* Borda esq: CARTEIRA DE IDENTIDADE ANIMAL */}
                    <div
                      style={{
                        borderRight: "1px solid rgba(74,110,88,0.25)",
                        flexShrink: 0,
                      }}
                    >
                      <VText w={26} h={HH} size={9} weight={700} rotate={-90} spacing={1.5}>
                        CARTEIRA DE IDENTIDADE ANIMAL
                      </VText>
                    </div>

                    {/* Campos: linhas label + valor */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 17,
                        padding: "16px 10px 16px 14px",
                        minWidth: 0,
                      }}
                    >
                      {/* NOME */}
                      <Field label="NOME" value={pet.nome} flex={1} vSize={15} />

                      {/* NASCIMENTO + Nº REGISTRO */}
                      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                        <Field label="NASCIMENTO" value={formatDate(pet.dataNascimento)} flex={1} />
                        <Field label="No REGISTRO" value={pet.registroId} flex={1} />
                      </div>

                      {/* NATURALIDADE + EXPEDIÇÃO */}
                      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                        <Field label="NATURALIDADE" value={naturalidade} flex={1} />
                        <Field label="EXPEDICAO" value={today} flex={0.85} />
                      </div>

                      {/* SEXO + ESPÉCIE + RAÇA */}
                      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                        <Field label="SEXO" value={pet.sexo} flex={0.55} />
                        <Field label="ESPECIE" value={speciesLabel[pet.especie] || pet.especie} flex={0.7} />
                        <Field label="RACA" value={pet.raca || "SRD"} flex={1} />
                      </div>

                      {/* CASTRADO + PORTE */}
                      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                        <Field label="CASTRADO" value={pet.castrado || "A VERIFICAR"} flex={1} />
                        <Field label="PORTE" value={pet.porte || "—"} flex={0.8} />
                      </div>

                      {/* TUTORES + PELAGEM */}
                      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                        <Field label="TUTORES" value={pet.nomeTutor} flex={1} />
                        <Field label="PELAGEM" value={pet.corPredominante || "—"} flex={0.8} />
                      </div>
                    </div>

                    {/* Borda dir: REGISTRADO POR */}
                    <VText w={22} h={HH} size={8} weight={700} rotate={90} spacing={0.4}>
                      REGISTRADO POR WWW.REGISTRAPET.PET
                    </VText>
                  </div>
                </div>
              </div>
              {/* ══════════ FIM CARD ══════════ */}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-[600px] mx-auto print:hidden">
          <Button variant="hero" size="lg" className="flex-1 h-14" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5 mr-1" />
            Baixar RG em PDF (A4)
          </Button>
          {navigator.share && (
            <Button variant="outline" size="lg" className="h-14" onClick={handleShare}>
              <Share2 className="w-5 h-5 mr-1" />
              Compartilhar
            </Button>
          )}
        </div>

        <div className="text-center mt-6 print:hidden">
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/cadastrar")}>
            + Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RGPage;
