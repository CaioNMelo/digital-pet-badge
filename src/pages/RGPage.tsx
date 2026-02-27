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

    // Configurações para o A4 (Paisagem) - 297mm x 210mm
    const pdfW = 297;
    const pdfH = 210;

    // Aumentar escala para melhor resolução
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Converter proporções para manter o layout intocado (calcula altura proporcional da div pra folha)
    const imgW = canvas.width;
    const imgH = canvas.height;

    // Queremos que a imagem docupe 260mm (para ter borda branca) e achamos a altura
    const printW = 260;
    const printH = (imgH * printW) / imgW;

    // Centralizar na horizontal e vertical (se couber)
    const x = (pdfW - printW) / 2;
    const y = printH < pdfH ? (pdfH - printH) / 2 : 10;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
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
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">RG Digital do Pet</h1>
          <p className="text-muted-foreground">Documento de <strong className="text-foreground">{pet.nome}</strong> pronto para download/impressão.</p>
        </div>

        {/* CONTAINER SCROLLÁVEL NA TELA PARA NÃO QUEBRAR O LAYOUT E MANTER PROPORÇÃO CORRETA PRA GERAR PDF */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1000px] flex justify-center">

            {/* INÍCIO DO RG - ESTILO IDENTIDADE ANIMAL DE PAPEL */}
            {/* Proporção aprox de um papel A4 paisagem (ou uma folha contendo as duas faces) */}
            <div
              ref={cardRef}
              className="relative w-[1000px] h-[660px] bg-white flex items-center justify-center p-6 shadow-2xl"
              style={{ fontFamily: "'Arial', sans-serif" }}
            >

              {/* Moldura Verde com Patinhas (Fundo Externo) */}
              <div
                className="absolute inset-4 rounded-md"
                style={{
                  backgroundColor: "#597E69", // Verde Escuro do Template
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 2c-1.6 0-3 1.5-3 3s1.4 3 3 3 3-1.5 3-3-1.4-3-3-3zM5.5 6C4.1 6 3 7.5 3 9s1.1 3 2.5 3S8 10.5 8 9 6.9 6 5.5 6zm13 0c-1.4 0-2.5 1.5-2.5 3s1.1 3 2.5 3S21 10.5 21 9s-1.1-3-2.5-3zM12 13c-2.4 0-4.5 1.5-5.5 3.5-.5 1 .2 2 1.2 2 .5 0 1-.2 1.5-.4 1-.5 2-.5 2.8-.5s1.8 0 2.8.5c.5.2 1 .4 1.5.4 1 0 1.7-1 1.2-2C16.5 14.5 14.4 13 12 13z' fill='%23ffffff' fill-opacity='0.07'/%3E%3C/svg%3E")`
                }}
              />

              {/* Container do Documento (As duas metades) */}
              <div className="relative w-full h-full flex gap-3 p-3">

                {/* METADE ESQUERDA - FRENTE */}
                <div
                  className="flex-1 rounded-sm relative"
                  style={{ backgroundColor: "#D4E8CD" }} // Verde Claro
                >
                  {/* Borda Esquerda - Registrado */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center"
                    style={{ backgroundColor: "#D4E8CD" }}
                  >
                    <span
                      className="text-[10px] font-bold tracking-tight transform rotate-180 select-none uppercase whitespace-nowrap"
                      style={{ writingMode: "vertical-rl", color: "#1a1a1a" }}
                    >
                      REGISTRADO POR WWW.REGISTRAPET.PET
                    </span>
                  </div>

                  {/* Conteúdo da Frente */}
                  <div className="absolute inset-y-0 left-10 right-4 py-8 flex items-center justify-between">

                    {/* Títulos Rotacionados */}
                    <div className="h-full flex flex-col justify-end items-center mr-4 w-12">
                      <span
                        className="text-2xl font-black transform rotate-180 whitespace-nowrap mb-2"
                        style={{ writingMode: "vertical-rl", color: "#1a1a1a", letterSpacing: "-0.5px" }}
                      >
                        REGISTRO DOS ANIMAIS DO BRASIL
                      </span>
                      <span
                        className="text-[10px] font-bold transform rotate-180 whitespace-nowrap"
                        style={{ writingMode: "vertical-rl", color: "#1a1a1a" }}
                      >
                        ATRAVÉS DO SITE WWW.REGISTRAPET.PET
                      </span>
                    </div>

                    {/* Área das Fotos/Patas */}
                    <div className="flex-1 flex flex-col items-center justify-between py-6 h-full mr-12">
                      {/* Caixa 1 - Espaço em branco pra Foto (ou com a foto preenchida) */}
                      <div className="w-56 h-56 bg-white border border-gray-400 p-1 flex items-center justify-center relative shadow-sm">
                        <img src={pet.foto} alt={pet.nome} className="w-full h-full object-cover" />
                      </div>

                      {/* Caixa 2 - Dedo do pet (Na versão app vamos pôr o qrcode) */}
                      <div className="w-56 h-56 bg-white border border-gray-400 p-2 flex items-center justify-center shadow-sm relative overflow-hidden">
                        {/* Marca d'agua da pata proximo ao original */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                          <PawPrint className="w-40 h-40 text-black" />
                        </div>
                        <QRCodeSVG
                          value={`https://registrarpet.com/consulta/${pet.registroId}`}
                          size={160}
                          level="M"
                          fgColor="#1a1a1a"
                          className="relative z-10"
                        />
                      </div>
                    </div>

                    {/* Assinatura Rotacionada */}
                    <div className="h-full flex flex-col justify-center items-center w-8">
                      <span
                        className="text-sm font-bold transform rotate-180 whitespace-nowrap"
                        style={{ writingMode: "vertical-rl", color: "#1a1a1a" }}
                      >
                        • ASSINATURA
                      </span>
                    </div>

                  </div>
                </div>


                {/* DIVISÓRIA (Dobra) */}
                <div className="w-4 flex flex-col items-center justify-between py-4 opacity-50 z-10">
                  <div className="w-px h-full border-r-2 border-dashed border-gray-400/50 mix-blend-overlay"></div>
                </div>


                {/* METADE DIREITA - VERSO */}
                <div
                  className="flex-1 rounded-sm relative overflow-hidden"
                  style={{ backgroundColor: "#D4E8CD" }} // Verde Claro
                >

                  {/* Título Rotacionado Carteira */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center border-r border-[#597E69]/20"
                    style={{ backgroundColor: "#D4E8CD" }}
                  >
                    <span
                      className="text-sm font-bold tracking-widest transform rotate-180 whitespace-nowrap"
                      style={{ writingMode: "vertical-rl", color: "#1a1a1a" }}
                    >
                      CARTEIRA DE IDENTIDADE ANIMAL
                    </span>
                  </div>

                  {/* Borda Direita - Registrado */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center"
                    style={{ backgroundColor: "#D4E8CD" }}
                  >
                    <span
                      className="text-[10px] font-bold tracking-tight transform rotate-180 select-none uppercase whitespace-nowrap"
                      style={{ writingMode: "vertical-rl", color: "#1a1a1a" }}
                    >
                      REGISTRADO POR WWW.REGISTRAPET.PET
                    </span>
                  </div>

                  {/* Dados - Grid */}
                  <div className="absolute inset-y-0 left-12 right-12 py-10 px-2 flex flex-col gap-8 justify-center">

                    {/* Linha 1 */}
                    <div className="flex gap-4 items-end relative">
                      <div className="w-16 font-bold text-sm text-[#1a1a1a]">NOME</div>
                      <div className="flex-1 border-b border-gray-500 font-bold text-xl uppercase pb-1 leading-none">
                        {pet.nome || "\u00A0"}
                      </div>
                    </div>

                    {/* Linha 2 */}
                    <div className="flex gap-6 items-end">
                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a] whitespace-nowrap">NASCIMENTO</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-base uppercase pb-1 leading-none text-center">
                          {formatDate(pet.dataNascimento) || "\u00A0"}
                        </div>
                      </div>

                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a] whitespace-nowrap">NÚMERO DE REGISTRO</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-base uppercase pb-1 leading-none text-center">
                          {pet.registroId || "\u00A0"}
                        </div>
                      </div>
                    </div>

                    {/* Linha 3 */}
                    <div className="flex gap-6 items-end">
                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a] whitespace-nowrap">NATURALIDADE</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-sm uppercase pb-1 leading-none truncate" title={pet.endereco}>
                          {/* Limitando o endereco pro layout nao quebrar se for gigante, ou apenas estado/cidade se tiver */}
                          {pet.endereco ? pet.endereco.includes('-') ? pet.endereco.split('-')[1].trim() : pet.endereco : "_________"}
                        </div>
                      </div>

                      <div className="flex-[0.8] flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a] whitespace-nowrap">DATA DE EXPEDIÇÃO</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-base uppercase pb-1 leading-none text-center">
                          {today}
                        </div>
                      </div>
                    </div>

                    {/* Linha 4 (Grid tripla para Sexo, Espécie, etc) */}
                    <div className="flex gap-6 items-end">
                      <div className="flex-[0.4] flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a]">SEXO</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-base uppercase pb-1 leading-none text-center">
                          {pet.sexo || "\u00A0"}
                        </div>
                      </div>

                      <div className="flex-[0.6] flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a] whitespace-nowrap">ESPÉCIE</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-sm uppercase pb-1 leading-none text-center">
                          {speciesLabel[pet.especie] || pet.especie || "\u00A0"}
                        </div>
                      </div>

                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a]">RAÇA</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-sm uppercase pb-1 leading-none text-center truncate">
                          {pet.raca || "SRD"}
                        </div>
                      </div>
                    </div>

                    {/* Linha 5 */}
                    <div className="flex gap-6 items-end">
                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a]">CASTRADO</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-base uppercase pb-1 leading-none text-center">
                          A VERIFICAR
                        </div>
                      </div>

                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a]">PORTE</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-base uppercase pb-1 leading-none text-center">
                          _______
                        </div>
                      </div>
                    </div>

                    {/* Linha 6 */}
                    <div className="flex gap-6 items-end pb-8">
                      <div className="flex-1 flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a]">TUTORES</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-sm uppercase pb-1 leading-none truncate">
                          {pet.nomeTutor || "\u00A0"}
                        </div>
                      </div>

                      <div className="flex-[0.8] flex gap-2 items-end">
                        <div className="font-bold text-sm text-[#1a1a1a]">PELAGEM</div>
                        <div className="flex-1 border-b border-gray-500 font-semibold text-sm uppercase pb-1 leading-none text-center">
                          {pet.corPredominante || "_______"}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Actions Button */}
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
