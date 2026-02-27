import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, PawPrint } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

const VerticalText = ({
  text,
  containerWidth,
  containerHeight,
  fontSize = 10,
  fontWeight = "bold",
  letterSpacing = "0.5px",
  direction = "bottom-to-top",
  color = "#1a1a1a",
}: {
  text: string;
  containerWidth: number;
  containerHeight: number;
  fontSize?: number;
  fontWeight?: string | number;
  letterSpacing?: string;
  direction?: "bottom-to-top" | "top-to-bottom";
  color?: string;
}) => {
  const rotate = direction === "bottom-to-top" ? -90 : 90;
  return (
    <div style={{ width: containerWidth, height: containerHeight, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, position: "relative" }}>
      <span style={{ position: "absolute", whiteSpace: "nowrap", fontSize: `${fontSize}px`, fontWeight, letterSpacing, color, textTransform: "uppercase", transform: `rotate(${rotate}deg)`, transformOrigin: "center center", maxWidth: containerHeight }}>
        {text}
      </span>
    </div>
  );
};

const Field = ({ label, value, flex = 1, large = false }: { label: string; value: string; flex?: number; large?: boolean }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flex, minWidth: 0 }}>
    <span style={{ fontSize: "10px", fontWeight: "bold", color: "#1a1a1a", whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1, paddingBottom: "2px" }}>{label}</span>
    <span style={{ flex: 1, borderBottom: "1.5px solid #444", fontSize: large ? "16px" : "12px", fontWeight: large ? "700" : "600", color: "#1a1a1a", textTransform: "uppercase", paddingBottom: "1px", lineHeight: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {value || "\u00A0"}
    </span>
  </div>
);

const RGPage = () => {
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

  const formatDate = (date: string) => {
    if (!date) return "Não informado";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const today = new Date().toLocaleDateString("pt-BR");

  const naturalidade = pet.endereco
    ? pet.endereco.includes(" - ") ? pet.endereco.split(" - ")[1].trim() : pet.endereco
    : "Não informado";

  // Converte img src para base64 via canvas
  const toBase64 = (src: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d")!.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = () => resolve("");
      img.src = src;
    });

  // Extrai QR Code do DOM como PNG base64
  const getQRBase64 = (): Promise<string> =>
    new Promise((resolve) => {
      const qrDiv = document.querySelector("[data-qr-export] svg") as SVGElement | null;
      if (!qrDiv) return resolve("");
      const serialized = new XMLSerializer().serializeToString(qrDiv);
      const blob = new Blob([serialized], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 300; c.height = 300;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0, 300, 300);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(""); };
      img.src = url;
    });

  const handleDownloadPDF = async () => {
    // A4 paisagem mm
    const PW = 297, PH = 210;
    const mg = 7; // margem da moldura

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Moldura verde escura
    pdf.setFillColor(74, 110, 88);
    pdf.roundedRect(mg, mg, PW - mg * 2, PH - mg * 2, 3, 3, "F");

    // Padding interno
    const p = 3;
    const iX = mg + p, iY = mg + p;
    const iW = PW - mg * 2 - p * 2;
    const iH = PH - mg * 2 - p * 2;

    // Metades
    const gap = 3;
    const hW = (iW - gap) / 2;
    const lX = iX, rX = iX + hW + gap;

    // Verde claro metades
    pdf.setFillColor(207, 232, 200);
    pdf.roundedRect(lX, iY, hW, iH, 2, 2, "F");
    pdf.roundedRect(rX, iY, hW, iH, 2, 2, "F");

    // Linha divisória pontilhada
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.25);
    pdf.setLineDashPattern([0.8, 0.8], 0);
    const dX = iX + hW + gap / 2;
    pdf.line(dX, iY + 4, dX, iY + iH - 4);
    pdf.setLineDashPattern([], 0);

    // ── Texto vertical (ângulo em graus) ──
    const vText = (text: string, cx: number, cy: number, size: number, angle: number, bold = true) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setTextColor(26, 26, 26);
      pdf.text(text.toUpperCase(), cx, cy, { angle, align: "center" });
    };

    // ── ESQUERDA ──
    // Borda esq
    vText("REGISTRADO POR WWW.REGISTRAPET.PET", lX + 3.5, iY + iH / 2, 5, 90);
    // Título grande
    vText("REGISTRO DOS ANIMAIS DO BRASIL", lX + 11, iY + iH * 0.55, 9, 90);
    // Subtítulo
    vText("ATRAVÉS DO SITE WWW.REGISTRAPET.PET", lX + 17, iY + iH * 0.55, 4.5, 90);
    // Assinatura
    vText("• ASSINATURA", lX + hW - 4, iY + iH / 2, 5.5, 90);

    // Foto
    const fX = lX + 23, fY = iY + 8, fW = 58, fH = 58;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(170, 170, 170);
    pdf.setLineWidth(0.3);
    pdf.rect(fX, fY, fW, fH, "FD");
    if (pet.foto) {
      try {
        const b64 = await toBase64(pet.foto);
        if (b64) pdf.addImage(b64, "JPEG", fX + 0.5, fY + 0.5, fW - 1, fH - 1);
      } catch { /* sem foto */ }
    }

    // QR Code
    const qX = lX + 23, qY = iY + 74, qS = 58;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(qX, qY, qS, qS, "FD");
    const qrB64 = await getQRBase64();
    if (qrB64) pdf.addImage(qrB64, "PNG", qX + 2, qY + 2, qS - 4, qS - 4);

    // ── DIREITA ──
    // Borda esq da direita
    vText("CARTEIRA DE IDENTIDADE ANIMAL", rX + 4, iY + iH / 2, 5.5, 90);
    // Borda dir da direita
    vText("REGISTRADO POR WWW.REGISTRAPET.PET", rX + hW - 3.5, iY + iH / 2, 5, -90);

    // Campos
    const dX = rX + 11;
    const maxW = hW - 19; // largura disponível para os campos
    let y = iY + 18;
    const gap2 = 15;

    // Helper campo
    const field = (label: string, value: string, x: number, fy: number, w: number, vSize = 9, lSize = 6) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(lSize);
      pdf.setTextColor(26, 26, 26);
      pdf.text(label.toUpperCase(), x, fy);
      const lW = pdf.getTextWidth(label.toUpperCase()) + 1.5;
      const vX = x + lW;
      const vW = w - lW;
      pdf.setFontSize(vSize);
      // trunca se necessário
      let val = (value || "").toUpperCase();
      while (val.length > 1 && pdf.getTextWidth(val) > vW) val = val.slice(0, -1);
      if ((value || "").toUpperCase() !== val) val += "…";
      pdf.text(val, vX, fy);
      pdf.setDrawColor(80, 80, 80);
      pdf.setLineWidth(0.25);
      pdf.line(vX, fy + 0.8, x + w, fy + 0.8);
    };

    // NOME
    field("NOME", pet.nome, dX, y, maxW, 12, 7);

    y += gap2;
    const hw2 = (maxW - 5) / 2;
    field("NASCIMENTO", formatDate(pet.dataNascimento), dX, y, hw2, 8.5, 6);
    field("Nº REGISTRO", pet.registroId, dX + hw2 + 5, y, hw2, 8.5, 6);

    y += gap2;
    field("NATURALIDADE", naturalidade, dX, y, hw2 + 3, 8.5, 6);
    field("EXPEDIÇÃO", today, dX + hw2 + 8, y, hw2 - 3, 8.5, 6);

    y += gap2;
    const t3 = (maxW - 8) / 3;
    field("SEXO", pet.sexo, dX, y, t3 - 1, 8.5, 6);
    field("ESPÉCIE", speciesLabel[pet.especie] || pet.especie, dX + t3 + 3, y, t3, 8.5, 6);
    field("RAÇA", pet.raca || "SRD", dX + (t3 + 3) * 2 + 2, y, t3 - 2, 8.5, 6);

    y += gap2;
    field("CASTRADO", "A VERIFICAR", dX, y, hw2 + 3, 8.5, 6);
    field("PORTE", "________", dX + hw2 + 8, y, hw2 - 3, 8.5, 6);

    y += gap2;
    field("TUTORES", pet.nomeTutor, dX, y, hw2 + 3, 8.5, 6);
    field("PELAGEM", pet.corPredominante || "________", dX + hw2 + 8, y, hw2 - 3, 8.5, 6);

    pdf.save(`RG_${pet.nome}_${pet.registroId}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `RG Digital - ${pet.nome}`, text: `Confira o RG Digital de ${pet.nome}! Registro: ${pet.registroId}` });
    }
  };

  const CARD_W = 940, CARD_H = 590, HALF_H = 570;

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
        <div className="text-center mb-10 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">✅ Registro concluído</div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download/impressão.</p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div style={{ minWidth: `${CARD_W}px`, display: "flex", justifyContent: "center" }}>
            <div style={{ width: `${CARD_W}px`, height: `${CARD_H}px`, backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", fontFamily: "Arial, sans-serif", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ position: "absolute", inset: "8px", borderRadius: "6px", backgroundColor: "#4a6e58", backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23ffffff' fill-opacity='0.08'/%3E%3C/svg%3E")` }} />
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", gap: "6px", padding: "10px" }}>

                {/* ESQUERDA */}
                <div style={{ flex: 1, borderRadius: "4px", backgroundColor: "#cfe8c8", display: "flex", overflow: "hidden" }}>
                  <VerticalText text="REGISTRADO POR WWW.REGISTRAPET.PET" containerWidth={24} containerHeight={HALF_H} fontSize={8} letterSpacing="0.8px" direction="bottom-to-top" />
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flexShrink: 0, height: "100%", justifyContent: "flex-end", paddingBottom: "4px" }}>
                      <VerticalText text="REGISTRO DOS ANIMAIS DO BRASIL" containerWidth={34} containerHeight={HALF_H - 60} fontSize={18} fontWeight={900} letterSpacing="0px" direction="bottom-to-top" />
                      <VerticalText text="ATRAVÉS DO SITE WWW.REGISTRAPET.PET" containerWidth={16} containerHeight={HALF_H - 60} fontSize={7} fontWeight="bold" letterSpacing="0.3px" direction="bottom-to-top" />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: "100%", padding: "0 12px" }}>
                      <div style={{ width: "168px", height: "168px", backgroundColor: "#fff", border: "1px solid #aaa", overflow: "hidden", flexShrink: 0 }}>
                        {pet.foto ? <img src={pet.foto} alt={pet.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <PawPrint style={{ width: "60px", height: "60px", color: "#ccc" }} />}
                      </div>
                      <div style={{ width: "168px", height: "168px", backgroundColor: "#fff", border: "1px solid #aaa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, opacity: 0.06, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <PawPrint style={{ width: "120px", height: "120px", color: "#000" }} />
                        </div>
                        <div data-qr-export="true" style={{ position: "relative", zIndex: 1 }}>
                          <QRCodeSVG value={`https://registrarpet.com/consulta/${pet.registroId}`} size={148} level="M" fgColor="#1a1a1a" />
                        </div>
                      </div>
                    </div>
                    <VerticalText text="• ASSINATURA" containerWidth={22} containerHeight={HALF_H} fontSize={10} fontWeight="bold" letterSpacing="1px" direction="bottom-to-top" />
                  </div>
                </div>

                {/* DIVISÓRIA */}
                <div style={{ width: "8px", display: "flex", alignItems: "stretch", justifyContent: "center", opacity: 0.35 }}>
                  <div style={{ width: "1px", borderLeft: "2px dashed rgba(0,0,0,0.4)", height: "100%" }} />
                </div>

                {/* DIREITA */}
                <div style={{ flex: 1, borderRadius: "4px", backgroundColor: "#cfe8c8", display: "flex", overflow: "hidden" }}>
                  <div style={{ borderRight: "1px solid rgba(74,110,88,0.2)", flexShrink: 0 }}>
                    <VerticalText text="CARTEIRA DE IDENTIDADE ANIMAL" containerWidth={26} containerHeight={HALF_H} fontSize={9} fontWeight="bold" letterSpacing="1.5px" direction="bottom-to-top" />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px", padding: "20px 10px 20px 16px", minWidth: 0 }}>
                    <Field label="NOME" value={pet.nome} large flex={1} />
                    <div style={{ display: "flex", gap: "14px" }}>
                      <Field label="NASCIMENTO" value={formatDate(pet.dataNascimento)} flex={1} />
                      <Field label="Nº REGISTRO" value={pet.registroId} flex={1} />
                    </div>
                    <div style={{ display: "flex", gap: "14px" }}>
                      <Field label="NATURALIDADE" value={naturalidade} flex={1} />
                      <Field label="EXPEDIÇÃO" value={today} flex={0.85} />
                    </div>
                    <div style={{ display: "flex", gap: "14px" }}>
                      <Field label="SEXO" value={pet.sexo} flex={0.55} />
                      <Field label="ESPÉCIE" value={speciesLabel[pet.especie] || pet.especie} flex={0.7} />
                      <Field label="RAÇA" value={pet.raca || "SRD"} flex={1} />
                    </div>
                    <div style={{ display: "flex", gap: "14px" }}>
                      <Field label="CASTRADO" value="A VERIFICAR" flex={1} />
                      <Field label="PORTE" value="________" flex={0.8} />
                    </div>
                    <div style={{ display: "flex", gap: "14px" }}>
                      <Field label="TUTORES" value={pet.nomeTutor} flex={1} />
                      <Field label="PELAGEM" value={pet.corPredominante || "________"} flex={0.8} />
                    </div>
                  </div>
                  <VerticalText text="REGISTRADO POR WWW.REGISTRAPET.PET" containerWidth={24} containerHeight={HALF_H} fontSize={8} letterSpacing="0.8px" direction="top-to-bottom" />
                </div>

              </div>
            </div>
          </div>
        </div>

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
