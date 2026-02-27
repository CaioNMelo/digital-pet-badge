import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, PawPrint, Syringe } from "lucide-react";
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

const VACCINE_ROWS = 12;

const VacinacaoPage = () => {
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

  const fmt = (d: string) => { if (!d) return "—"; const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; };
  const today = new Date().toLocaleDateString("pt-BR");

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const imgData = await toJpeg(cardRef.current, { quality: 0.97, pixelRatio: 3, backgroundColor: "#ffffff", fetchRequestInit: { cache: "no-cache" } });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const imgW = pageW - 20;
    const imgH = imgW * (1100 / 800);
    const y = Math.max((297 - imgH) / 2, 10);
    pdf.addImage(imgData, "JPEG", 10, y, imgW, imgH);
    pdf.save(`Carteira_Vacinacao_${pet.nome}_${pet.registroId}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: `Carteira de Vacinação - ${pet.nome}`, text: `Carteira de Vacinação de ${pet.nome}!` });
  };

  const CW = 800, CH = 1100;

  const thStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, color: "#fff", textTransform: "uppercase",
    letterSpacing: 0.8, padding: "8px 6px", textAlign: "center",
    fontFamily: "Arial, sans-serif", borderRight: "1px solid #2a5c1a",
  };
  const tdStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: "#1a1a1a", padding: "7px 6px",
    textAlign: "center", fontFamily: "Arial, sans-serif",
    borderRight: "1px solid #c8d6c0", borderBottom: "1px solid #c8d6c0",
    minHeight: 28,
  };

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
            <Syringe className="w-4 h-4" /> Carteira de Vacinação
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Carteira de Vacinação</h1>
          <p className="text-muted-foreground">Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download.</p>
        </div>

        {/* Container responsivo */}
        <div className="flex justify-center w-full mb-6 overflow-hidden">
          <div style={{ width: CW * scale, height: CH * scale, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${scale})`, width: CW, height: CH }}>

              {/* CARTEIRA DE VACINAÇÃO */}
              <div ref={cardRef} style={{
                width: CW, height: CH, backgroundColor: "#faf8f0", fontFamily: "Arial, sans-serif",
                position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                border: "3px solid #3a6e28", display: "flex", flexDirection: "column",
              }}>
                {/* Bordas decorativas */}
                <div style={{ position: "absolute", inset: 6, border: "2px solid #6ba354", borderRadius: 4, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 10, border: "1px solid #a8cc96", borderRadius: 2, pointerEvents: "none" }} />

                {/* Padrão de fundo */}
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23000'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                }} />

                {/* CABEÇALHO */}
                <div style={{ position: "relative", padding: "24px 40px 16px", textAlign: "center", borderBottom: "2px solid #3a6e28" }}>
                  <div style={{ position: "absolute", left: 30, top: 16, width: 60, height: 60, borderRadius: "50%", border: "2px solid #3a6e28", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e8f0e0" }}>
                    <span style={{ fontSize: 28 }}>💉</span>
                  </div>
                  <div style={{ position: "absolute", right: 30, top: 16, width: 60, height: 60, borderRadius: "50%", border: "2px solid #3a6e28", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e8f0e0" }}>
                    <span style={{ fontSize: 28 }}>🐾</span>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#2d5016", letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 }}>
                    República Federativa do Brasil
                  </p>
                  <p style={{ fontSize: 8, color: "#4a7a32", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                    Registro Nacional de Animais de Estimação
                  </p>
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1a3a0e", letterSpacing: 3, textTransform: "uppercase", margin: "4px 0", fontFamily: "Georgia, serif" }}>
                    Carteira de Vacinação
                  </h1>
                  <p style={{ fontSize: 9, color: "#4a7a32", letterSpacing: 1.5, textTransform: "uppercase" }}>
                    Controle de Imunização Animal — www.registrapet.pet
                  </p>
                </div>

                {/* DADOS DO PET */}
                <div style={{ position: "relative", padding: "16px 40px", display: "flex", gap: 20, borderBottom: "2px solid #3a6e28" }}>
                  {/* Foto */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: 100, height: 100, border: "2px solid #3a6e28", borderRadius: 8,
                      overflow: "hidden", backgroundColor: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {pet.foto ? (
                        <img src={pet.foto} alt={pet.nome} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <PawPrint style={{ width: 40, height: 40, color: "#ccc" }} />
                      )}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px" }}>
                    {[
                      { l: "Nome", v: pet.nome },
                      { l: "Espécie", v: speciesLabel[pet.especie] || pet.especie },
                      { l: "Raça", v: pet.raca || "SRD" },
                      { l: "Sexo", v: pet.sexo },
                      { l: "Nasc.", v: fmt(pet.dataNascimento) },
                      { l: "Pelagem", v: pet.corPredominante || "—" },
                      { l: "Porte", v: pet.porte || "—" },
                      { l: "Microchip", v: pet.microchip || "—" },
                      { l: "Registro", v: pet.registroId },
                    ].map((f) => (
                      <div key={f.l}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>{f.l}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", display: "block", marginTop: 1 }}>{f.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{
                      width: 80, height: 80, backgroundColor: "#fff", border: "2px solid #3a6e28",
                      borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", padding: 3,
                    }}>
                      <QRCodeSVG value={`https://registrarpet.com/consulta/${pet.registroId}`} size={70} level="M" fgColor="#1a3a0e" />
                    </div>
                    <span style={{ fontSize: 6, color: "#6b8a5e", textTransform: "uppercase", letterSpacing: 0.5 }}>Verificação</span>
                  </div>
                </div>

                {/* TUTOR */}
                <div style={{ position: "relative", padding: "10px 40px", borderBottom: "2px solid #3a6e28", display: "flex", gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5 }}>Tutor Responsável</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", display: "block", marginTop: 2 }}>{pet.nomeTutor}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5 }}>CPF</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", display: "block", marginTop: 2 }}>{pet.cpfTutor}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 0.5 }}>Telefone</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", display: "block", marginTop: 2 }}>{pet.telefone || "—"}</span>
                  </div>
                </div>

                {/* TABELA DE VACINAS */}
                <div style={{ flex: 1, position: "relative", padding: "16px 40px 12px", display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#2d5016", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                    Registro de Vacinação
                  </p>

                  <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #3a6e28" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#3a6e28" }}>
                        <th style={{ ...thStyle, width: "4%" }}>Nº</th>
                        <th style={{ ...thStyle, width: "22%" }}>Vacina</th>
                        <th style={{ ...thStyle, width: "12%" }}>Data</th>
                        <th style={{ ...thStyle, width: "14%" }}>Lote / Fab.</th>
                        <th style={{ ...thStyle, width: "18%" }}>Veterinário</th>
                        <th style={{ ...thStyle, width: "10%" }}>CRMV</th>
                        <th style={{ ...thStyle, width: "12%" }}>Próx. Dose</th>
                        <th style={{ ...thStyle, width: "8%", borderRight: "none" }}>Ass.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: VACCINE_ROWS }).map((_, i) => (
                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f5f9f0" : "#fff" }}>
                          <td style={{ ...tdStyle, fontSize: 9, fontWeight: 700, color: "#6b8a5e" }}>{i + 1}</td>
                          <td style={tdStyle}>&nbsp;</td>
                          <td style={tdStyle}>&nbsp;</td>
                          <td style={tdStyle}>&nbsp;</td>
                          <td style={tdStyle}>&nbsp;</td>
                          <td style={tdStyle}>&nbsp;</td>
                          <td style={tdStyle}>&nbsp;</td>
                          <td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* OBSERVAÇÕES + RODAPÉ */}
                <div style={{ position: "relative", padding: "0 40px 8px" }}>
                  <div style={{ border: "1px solid #c8d6c0", borderRadius: 4, padding: "8px 12px", marginBottom: 8, minHeight: 40 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#2d5016", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>
                      Observações / Alergias / Reações
                    </span>
                    <div style={{ borderBottom: "1px dotted #c8d6c0", height: 14 }} />
                    <div style={{ borderBottom: "1px dotted #c8d6c0", height: 14 }} />
                  </div>
                </div>

                {/* Rodapé */}
                <div style={{ padding: "8px 40px", borderTop: "2px solid #3a6e28", backgroundColor: "#e8f0e0", textAlign: "center" }}>
                  <p style={{ fontSize: 7, color: "#4a7a32", letterSpacing: 1 }}>
                    DOCUMENTO EMITIDO POR WWW.REGISTRAPET.PET — CONTROLE DE IMUNIZAÇÃO ANIMAL — {today}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 max-w-[600px] mx-auto print:hidden">
          <Button variant="hero" size="lg" className="flex-1 h-14" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5 mr-1" />Baixar Carteira em PDF
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
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/certidao", { state: { pet } })}>
            📜 Ver Certidão
          </Button>
          <Button variant="ghost" className="text-primary" onClick={() => navigate("/cadastrar")}>
            + Cadastrar outro pet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default VacinacaoPage;
