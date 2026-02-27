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

// ─────────────────────────────────────────────────────────────
// IMPORTANTE: NÃO usar writing-mode em NENHUM elemento.
// Apenas transform: rotate(). O html2canvas renderiza rotate
// corretamente mas NÃO renderiza writing-mode.
// ─────────────────────────────────────────────────────────────

/**
 * Caixa com texto rotacionado usando APENAS transform: rotate.
 * containerW e containerH são as dimensões VISUAIS do bloco na tela.
 * O span interno tem width = containerH para o texto caber na rotação.
 */
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
  w: number;   // largura visual do container (= espessura da faixa)
  h: number;   // altura visual do container
  size?: number;
  weight?: number;
  rotate?: number; // -90 = de baixo pra cima, 90 = de cima pra baixo
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
        // Gira em torno do centro. width = h para o texto ter espaço suficiente.
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

/** Campo label + underline + valor */
const F = ({
  label,
  value,
  flex = 1,
  vSize = 12,
}: {
  label: string;
  value: string;
  flex?: number;
  vSize?: number;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 5,
      flex,
      minWidth: 0,
    }}
  >
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
          <Button variant="hero" size="lg" onClick={() => navigate("/cadastrar")}>
            Cadastrar Pet
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return "Nao informado";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const today = new Date().toLocaleDateString("pt-BR");

  const naturalidade = pet.endereco
    ? pet.endereco.includes(" - ")
      ? pet.endereco.split(" - ")[1].trim()
      : pet.endereco
    : "Nao informado";

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    // Esconde elementos que não devem aparecer no PDF
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      // CRÍTICO: desabilita foreignObject — força renderização nativa do canvas
      // que respeita transform: rotate corretamente
      foreignObjectRendering: false,
      // Garante que imagens de outras origens sejam carregadas
      onclone: (_doc, element) => {
        // Remove qualquer writing-mode residual no clone
        element.querySelectorAll("*").forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            htmlEl.style.writingMode = "";
          }
        });
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.97);
    const imgW = canvas.width;
    const imgH = canvas.height;

    const pdfW = 297;
    const pdfH = 210;
    const printW = pdfW - 16;
    const printH = (imgH * printW) / imgW;
    const x = 8;
    const y = printH < pdfH ? (pdfH - printH) / 2 : 4;

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

  // Dimensões fixas do card
  const CW = 960; // card width px
  const CH = 600; // card height px
  const HH = CH - 24; // altura útil das metades

  return (
    <div className="min-h-screen bg-muted/50">
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
        <div className="text-center mb-10 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ✅ Registro concluído
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            RG Digital do Pet
          </h1>
          <p className="text-muted-foreground">
            Documento de{" "}
            <strong className="text-foreground">{pet.nome}</strong> pronto para
            download/impressão.
          </p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div
            style={{
              minWidth: CW,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* ══════════════════════════════════════
                CARD DO RG — tudo inline style
                Nenhum writing-mode em nenhum lugar!
            ══════════════════════════════════════ */}
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
              {/* Moldura verde escura */}
              <div
                style={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: 6,
                  backgroundColor: "#4a6e58",
                }}
              />

              {/* Conteúdo (2 metades) */}
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
                {/* ═══ METADE ESQUERDA ═══ */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 4,
                    backgroundColor: "#cfe8c8",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  {/* Faixa borda esq */}
                  <VText w={22} h={HH} size={8} weight={700} rotate={-90} spacing={0.4}>
                    REGISTRADO POR WWW.REGISTRAPET.PET
                  </VText>

                  {/* Área central */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 6px",
                      gap: 6,
                    }}
                  >
                    {/* Título + subtítulo */}
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

                    {/* Foto + QR */}
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
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <PawPrint
                            style={{ width: 60, height: 60, color: "#ccc" }}
                          />
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
                          <PawPrint
                            style={{ width: 120, height: 120, color: "#000" }}
                          />
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

                {/* ═══ DIVISÓRIA ═══ */}
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

                {/* ═══ METADE DIREITA ═══ */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 4,
                    backgroundColor: "#cfe8c8",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  {/* Borda esq: Carteira */}
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

                  {/* Campos */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 18,
                      padding: "16px 8px 16px 14px",
                      minWidth: 0,
                    }}
                  >
                    {/* NOME */}
                    <F label="NOME" value={pet.nome} flex={1} vSize={15} />

                    {/* NASCIMENTO + Nº REGISTRO */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <F label="NASCIMENTO" value={formatDate(pet.dataNascimento)} flex={1} />
                      <F label="No REGISTRO" value={pet.registroId} flex={1} />
                    </div>

                    {/* NATURALIDADE + EXPEDIÇÃO */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <F label="NATURALIDADE" value={naturalidade} flex={1} />
                      <F label="EXPEDICAO" value={today} flex={0.85} />
                    </div>

                    {/* SEXO + ESPÉCIE + RAÇA */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <F label="SEXO" value={pet.sexo} flex={0.55} />
                      <F label="ESPECIE" value={speciesLabel[pet.especie] || pet.especie} flex={0.7} />
                      <F label="RACA" value={pet.raca || "SRD"} flex={1} />
                    </div>

                    {/* CASTRADO + PORTE */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <F label="CASTRADO" value="A VERIFICAR" flex={1} />
                      <F label="PORTE" value="________" flex={0.8} />
                    </div>

                    {/* TUTORES + PELAGEM */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <F label="TUTORES" value={pet.nomeTutor} flex={1} />
                      <F label="PELAGEM" value={pet.corPredominante || "________"} flex={0.8} />
                    </div>
                  </div>

                  {/* Borda dir */}
                  <VText w={22} h={HH} size={8} weight={700} rotate={90} spacing={0.4}>
                    REGISTRADO POR WWW.REGISTRAPET.PET
                  </VText>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-[600px] mx-auto print:hidden">
          <Button
            variant="hero"
            size="lg"
            className="flex-1 h-14"
            onClick={handleDownloadPDF}
          >
            <Download className="w-5 h-5 mr-1" />
            Baixar RG em PDF (A4)
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-1" />
              Compartilhar
            </Button>
          )}
        </div>

        <div className="text-center mt-6 print:hidden">
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => navigate("/cadastrar")}
          >
            + Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RGPage;
