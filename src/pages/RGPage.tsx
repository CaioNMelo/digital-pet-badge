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

// Estilos inline para textos verticais — evita conflito do Tailwind com writing-mode
const verticalTextStyle: React.CSSProperties = {
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  whiteSpace: "nowrap",
  userSelect: "none",
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
          <Button variant="hero" size="lg" onClick={() => navigate("/cadastrar")}>
            Cadastrar Pet
          </Button>
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

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const imgW = canvas.width;
    const imgH = canvas.height;

    // A4 paisagem: 297 x 210 mm
    const pdfW = 297;
    const pdfH = 210;

    // Ajusta para caber com margem de 10mm em cada lado
    const printW = pdfW - 20;
    const printH = (imgH * printW) / imgW;

    const x = 10;
    const y = printH < pdfH ? (pdfH - printH) / 2 : 5;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

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

  // Naturalidade: se o endereço contiver " - " pega só a cidade/estado
  const naturalidade = pet.endereco
    ? pet.endereco.includes(" - ")
      ? pet.endereco.split(" - ")[1].trim()
      : pet.endereco
    : "Não informado";

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
        {/* Título da página */}
        <div className="text-center mb-10 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ✅ Registro concluído
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">
            Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download/impressão.
          </p>
        </div>

        {/* Scroll horizontal para não quebrar o card */}
        <div className="overflow-x-auto pb-4">
          <div style={{ minWidth: "900px", display: "flex", justifyContent: "center" }}>

            {/* ===== CARD RG ===== */}
            {/* Dimensões fixas proporcionais a um A4 paisagem */}
            <div
              ref={cardRef}
              style={{
                width: "900px",
                height: "580px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                fontFamily: "'Arial', sans-serif",
                position: "relative",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              {/* Moldura externa verde escura com padrão de patinhas */}
              <div
                style={{
                  position: "absolute",
                  inset: "8px",
                  borderRadius: "6px",
                  backgroundColor: "#4a6e58",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23ffffff' fill-opacity='0.08'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Conteúdo (as duas metades) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  gap: "6px",
                  padding: "10px",
                }}
              >

                {/* ========== METADE ESQUERDA ========== */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: "4px",
                    backgroundColor: "#cfe8c8",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  {/* Borda esquerda: "REGISTRADO POR..." */}
                  <div
                    style={{
                      width: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        ...verticalTextStyle,
                        fontSize: "8px",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                        color: "#1a1a1a",
                        textTransform: "uppercase",
                      }}
                    >
                      REGISTRADO POR WWW.REGISTRAPET.PET
                    </span>
                  </div>

                  {/* Área central esquerda */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 8px",
                    }}
                  >
                    {/* Título vertical: "REGISTRO DOS ANIMAIS DO BRASIL" */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        flexShrink: 0,
                        width: "36px",
                      }}
                    >
                      <span
                        style={{
                          ...verticalTextStyle,
                          fontSize: "17px",
                          fontWeight: "900",
                          color: "#1a1a1a",
                          letterSpacing: "0px",
                          lineHeight: 1,
                        }}
                      >
                        REGISTRO DOS ANIMAIS DO BRASIL
                      </span>
                      <span
                        style={{
                          ...verticalTextStyle,
                          fontSize: "7px",
                          fontWeight: "bold",
                          color: "#1a1a1a",
                          marginTop: "6px",
                        }}
                      >
                        ATRAVÉS DO SITE WWW.REGISTRAPET.PET
                      </span>
                    </div>

                    {/* Coluna de imagens: Foto + QR Code */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        gap: "10px",
                        height: "100%",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                      }}
                    >
                      {/* Foto do pet */}
                      <div
                        style={{
                          width: "160px",
                          height: "160px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #aaa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {pet.foto ? (
                          <img
                            src={pet.foto}
                            alt={pet.nome}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <PawPrint style={{ width: "60px", height: "60px", color: "#ccc" }} />
                        )}
                      </div>

                      {/* QR Code */}
                      <div
                        style={{
                          width: "160px",
                          height: "160px",
                          backgroundColor: "#ffffff",
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
                            opacity: 0.07,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PawPrint style={{ width: "120px", height: "120px", color: "#000" }} />
                        </div>
                        <QRCodeSVG
                          value={`https://registrarpet.com/consulta/${pet.registroId}`}
                          size={140}
                          level="M"
                          fgColor="#1a1a1a"
                          style={{ position: "relative", zIndex: 1 }}
                        />
                      </div>
                    </div>

                    {/* Assinatura vertical */}
                    <div
                      style={{
                        width: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          ...verticalTextStyle,
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#1a1a1a",
                        }}
                      >
                        • ASSINATURA
                      </span>
                    </div>
                  </div>
                </div>

                {/* ========== DIVISÓRIA ========== */}
                <div
                  style={{
                    width: "8px",
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "center",
                    opacity: 0.4,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: "1px",
                      borderLeft: "2px dashed rgba(100,100,100,0.5)",
                      height: "100%",
                    }}
                  />
                </div>

                {/* ========== METADE DIREITA ========== */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: "4px",
                    backgroundColor: "#cfe8c8",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  {/* Borda esquerda: "CARTEIRA DE IDENTIDADE ANIMAL" */}
                  <div
                    style={{
                      width: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      borderRight: "1px solid rgba(74,110,88,0.2)",
                    }}
                  >
                    <span
                      style={{
                        ...verticalTextStyle,
                        fontSize: "9px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        color: "#1a1a1a",
                        textTransform: "uppercase",
                      }}
                    >
                      CARTEIRA DE IDENTIDADE ANIMAL
                    </span>
                  </div>

                  {/* Área dos dados */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "18px",
                      padding: "20px 10px 20px 14px",
                    }}
                  >

                    {/* Campo helper */}
                    {(() => {
                      const Field = ({
                        label,
                        value,
                        flex = 1,
                        large = false,
                      }: {
                        label: string;
                        value: string;
                        flex?: number;
                        large?: boolean;
                      }) => (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flex }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "#1a1a1a",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              borderBottom: "1px solid #555",
                              fontSize: large ? "15px" : "11px",
                              fontWeight: "600",
                              color: "#1a1a1a",
                              textTransform: "uppercase",
                              paddingBottom: "1px",
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

                      return (
                        <>
                          {/* Linha 1: NOME */}
                          <Field label="NOME" value={pet.nome} large flex={1} />

                          {/* Linha 2: NASCIMENTO + NÚMERO DE REGISTRO */}
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Field label="NASCIMENTO" value={formatDate(pet.dataNascimento)} flex={1} />
                            <Field label="Nº REGISTRO" value={pet.registroId} flex={1} />
                          </div>

                          {/* Linha 3: NATURALIDADE + DATA DE EXPEDIÇÃO */}
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Field label="NATURALIDADE" value={naturalidade} flex={1} />
                            <Field label="EXPEDIÇÃO" value={today} flex={0.8} />
                          </div>

                          {/* Linha 4: SEXO + ESPÉCIE + RAÇA */}
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Field label="SEXO" value={pet.sexo} flex={0.6} />
                            <Field label="ESPÉCIE" value={speciesLabel[pet.especie] || pet.especie} flex={0.7} />
                            <Field label="RAÇA" value={pet.raca || "SRD"} flex={1} />
                          </div>

                          {/* Linha 5: CASTRADO + PORTE */}
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Field label="CASTRADO" value="A VERIFICAR" flex={1} />
                            <Field label="PORTE" value="________" flex={0.8} />
                          </div>

                          {/* Linha 6: TUTORES + PELAGEM */}
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Field label="TUTORES" value={pet.nomeTutor} flex={1} />
                            <Field label="PELAGEM" value={pet.corPredominante || "________"} flex={0.8} />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Borda direita: "REGISTRADO POR..." */}
                  <div
                    style={{
                      width: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        ...verticalTextStyle,
                        fontSize: "8px",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                        color: "#1a1a1a",
                        textTransform: "uppercase",
                      }}
                    >
                      REGISTRADO POR WWW.REGISTRAPET.PET
                    </span>
                  </div>
                </div>

              </div>
            </div>
            {/* ===== FIM CARD RG ===== */}

          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-[600px] mx-auto print:hidden">
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
