import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, PawPrint, FileText } from "lucide-react";
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

const CertidaoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const avail = window.innerWidth - 32;
    return avail < 800 ? avail / 800 : 1;
  });
  const pet = (location.state as { pet: PetData })?.pet;

  useEffect(() => {
    const update = () => {
      const avail = window.innerWidth - 32;
      setScale(avail < 800 ? avail / 800 : 1);
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

  const fmt = (d: string) => { if (!d) return "Não informado"; const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; };
  const today = new Date().toLocaleDateString("pt-BR");
  const naturalidade = pet.cidade
    ? pet.estado ? `${pet.cidade} - ${pet.estado}` : pet.cidade
    : pet.endereco ? pet.endereco.split(" - ").slice(-1)[0].trim() : "Não informado";

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const imgData = await toJpeg(cardRef.current, { quality: 0.97, pixelRatio: 3, backgroundColor: "#ffffff", fetchRequestInit: { cache: "no-cache" } });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297;
    const imgW = pageW - 20;
    const imgH = imgW * (1100 / 800);
    const y = Math.max((pageH - imgH) / 2, 10);
    pdf.addImage(imgData, "JPEG", 10, y, imgW, imgH);
    pdf.save(`Certidao_Nascimento_${pet.nome}_${pet.registroId}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: `Certidão de Nascimento - ${pet.nome}`, text: `Certidão de Nascimento de ${pet.nome}!` });
  };

  const CW = 800, CH = 1100;

  // Field row helper
  const FieldRow = ({ label, value, border = true }: { label: string; value: string; border?: boolean }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "10px 0", borderBottom: border ? "1px solid #c8d6c0" : "none" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5, minWidth: 160, fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", fontFamily: "Arial, sans-serif", flex: 1 }}>{value || "—"}</span>
    </div>
  );

  const FieldRowDouble = ({ label1, value1, label2, value2, border = true }: { label1: string; value1: string; label2: string; value2: string; border?: boolean }) => (
    <div style={{ display: "flex", gap: 24, padding: "10px 0", borderBottom: border ? "1px solid #c8d6c0" : "none" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5, minWidth: 130, fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{label1}:</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", fontFamily: "Arial, sans-serif" }}>{value1 || "—"}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5, minWidth: 130, fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{label2}:</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", fontFamily: "Arial, sans-serif" }}>{value2 || "—"}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/50 overflow-x-hidden">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 print:hidden">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold">Registrar<span className="text-primary">Pet</span></span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl overflow-x-hidden">
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <FileText className="w-4 h-4" /> Certidão de Nascimento
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Certidão de Nascimento do Pet</h1>
          <p className="text-muted-foreground">Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download.</p>
        </div>

        {/* Container responsivo */}
        <div className="flex justify-center w-full mb-6 overflow-hidden">
          <div style={{ width: CW * scale, height: CH * scale, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${scale})`, width: CW, height: CH }}>

              {/* CERTIDÃO */}
              <div ref={cardRef} style={{
                width: CW, height: CH, backgroundColor: "#faf8f0", fontFamily: "Arial, sans-serif",
                position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                border: "3px solid #3a6e28", display: "flex", flexDirection: "column",
              }}>
                {/* Borda decorativa interna */}
                <div style={{ position: "absolute", inset: 6, border: "2px solid #6ba354", borderRadius: 4, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 10, border: "1px solid #a8cc96", borderRadius: 2, pointerEvents: "none" }} />

                {/* Padrão de patinhas de fundo */}
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23000'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                }}>
                </div>

                {/* CABEÇALHO */}
                <div style={{ position: "relative", padding: "28px 40px 20px", textAlign: "center", borderBottom: "2px solid #3a6e28" }}>
                  {/* Selo esquerdo */}
                  <div style={{ position: "absolute", left: 30, top: 20, width: 70, height: 70, borderRadius: "50%", border: "2px solid #3a6e28", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e8f0e0" }}>
                    <span style={{ fontSize: 32 }}>🐾</span>
                  </div>
                  {/* Selo direito */}
                  <div style={{ position: "absolute", right: 30, top: 20, width: 70, height: 70, borderRadius: "50%", border: "2px solid #3a6e28", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e8f0e0" }}>
                    <span style={{ fontSize: 32 }}>🏛️</span>
                  </div>

                  <p style={{ fontSize: 11, fontWeight: 700, color: "#2d5016", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
                    República Federativa do Brasil
                  </p>
                  <p style={{ fontSize: 9, color: "#4a7a32", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                    Registro Nacional de Animais de Estimação
                  </p>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a3a0e", letterSpacing: 4, textTransform: "uppercase", margin: "8px 0 4px", fontFamily: "Georgia, serif" }}>
                    Certidão de Nascimento
                  </h1>
                  <p style={{ fontSize: 10, color: "#4a7a32", letterSpacing: 1.5, textTransform: "uppercase" }}>
                    Documento de Registro Animal — www.registrapet.pet
                  </p>
                </div>

                {/* CORPO */}
                <div style={{ flex: 1, position: "relative", padding: "20px 40px", display: "flex", flexDirection: "column", gap: 0 }}>

                  {/* FOTO + INFO PRINCIPAL */}
                  <div style={{ display: "flex", gap: 24, marginBottom: 16, paddingBottom: 16, borderBottom: "2px solid #3a6e28" }}>
                    {/* Foto */}
                    <div style={{ flexShrink: 0 }}>
                      <div style={{
                        width: 150, height: 150, border: "3px solid #3a6e28", borderRadius: 8,
                        overflow: "hidden", backgroundColor: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}>
                        {pet.foto ? (
                          <img src={pet.foto} alt={pet.nome} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <PawPrint style={{ width: 50, height: 50, color: "#ccc" }} />
                        )}
                      </div>
                      <p style={{ textAlign: "center", fontSize: 8, color: "#6b8a5e", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                        Foto 3x4
                      </p>
                    </div>

                    {/* Dados principais */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 1 }}>Nome do Animal</span>
                        <p style={{ fontSize: 26, fontWeight: 900, color: "#1a3a0e", fontFamily: "Georgia, serif", marginTop: 2, lineHeight: 1.1 }}>
                          {pet.nome}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5 }}>Nº Registro</span>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginTop: 2, fontFamily: "monospace" }}>{pet.registroId}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5 }}>Data de Expedição</span>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginTop: 2 }}>{today}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DADOS DO ANIMAL */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#2d5016", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, borderBottom: "1px solid #2d5016", paddingBottom: 4 }}>
                      Dados do Animal
                    </p>
                    <FieldRowDouble label1="Espécie" value1={speciesLabel[pet.especie] || pet.especie} label2="Raça" value2={pet.raca || "SRD"} />
                    <FieldRowDouble label1="Sexo" value1={pet.sexo} label2="Porte" value2={pet.porte || "Não informado"} />
                    <FieldRowDouble label1="Data de Nasc." value1={fmt(pet.dataNascimento)} label2="Naturalidade" value2={naturalidade} />
                    <FieldRowDouble label1="Pelagem / Cor" value1={pet.corPredominante || "Não informado"} label2="Castrado(a)" value2={pet.castrado || "A Verificar"} />
                    <FieldRow label="Microchip" value={pet.microchip || "Não possui"} />
                  </div>

                  {/* DADOS DO TUTOR */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#2d5016", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, borderBottom: "1px solid #2d5016", paddingBottom: 4 }}>
                      Dados do Tutor Responsável
                    </p>
                    <FieldRow label="Tutor Principal" value={pet.nomeTutor} />
                    {pet.nomeTutor2 && <FieldRow label="2º Tutor" value={pet.nomeTutor2} />}
                    <FieldRow label="CPF" value={pet.cpfTutor} />
                    <FieldRowDouble label1="Telefone" value1={pet.telefone || "Não informado"} label2="E-mail" value2={pet.email || "Não informado"} />
                    <FieldRow label="Endereço" value={pet.endereco || "Não informado"} border={false} />
                  </div>

                  {/* QR CODE + ASSINATURAS */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 16, borderTop: "2px solid #3a6e28" }}>
                    {/* QR Code */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: 100, height: 100, backgroundColor: "#fff", border: "2px solid #3a6e28",
                        borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 4,
                      }}>
                        <QRCodeSVG value={`https://registrarpet.com/consulta/${pet.registroId}`} size={88} level="M" fgColor="#1a3a0e" />
                      </div>
                      <span style={{ fontSize: 7, color: "#6b8a5e", textTransform: "uppercase", letterSpacing: 1 }}>
                        Verificação Digital
                      </span>
                    </div>

                    {/* Assinaturas */}
                    <div style={{ display: "flex", gap: 40 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 180, borderBottom: "1.5px solid #1a1a1a", marginBottom: 4, height: 30 }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#2d5016", textTransform: "uppercase" }}>Assinatura do Tutor</span>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 180, borderBottom: "1.5px solid #1a1a1a", marginBottom: 4, height: 30 }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#2d5016", textTransform: "uppercase" }}>Registro Pet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RODAPÉ */}
                <div style={{ padding: "10px 40px", borderTop: "2px solid #3a6e28", backgroundColor: "#e8f0e0", textAlign: "center" }}>
                  <p style={{ fontSize: 8, color: "#4a7a32", letterSpacing: 1 }}>
                    DOCUMENTO EMITIDO POR WWW.REGISTRAPET.PET — REGISTRO NACIONAL DE ANIMAIS DE ESTIMAÇÃO — {today}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-[600px] mx-auto print:hidden">
          <Button variant="hero" size="lg" className="flex-1 h-14" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5 mr-1" />Baixar Certidão em PDF
          </Button>
          {navigator.share && (
            <Button variant="outline" size="lg" className="h-14" onClick={handleShare}>
              <Share2 className="w-5 h-5 mr-1" />Compartilhar
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-[600px] mx-auto print:hidden justify-center">
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/rg", { state: { pet } })}>
            📋 Ver RG Digital
          </Button>
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/cadastrar")}>
            + Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CertidaoPage;
