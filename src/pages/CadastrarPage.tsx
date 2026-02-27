import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  AlertCircle,
  CheckCircle2,
  PawPrint,
  User,
  MapPin,
  Heart,
  Sparkles,
  Upload,
} from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────
const generateId = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `PET-${now.toString(36).toUpperCase()}-${random.toString().padStart(4, "0")}`;
};

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const validateCPF = (cpf: string) => {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let c = 11 - (sum % 11);
  if (c >= 10) c = 0;
  if (parseInt(d[9]) !== c) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  c = 11 - (sum % 11);
  if (c >= 10) c = 0;
  return parseInt(d[10]) === c;
};

// ─── Step Config ──────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Sobre o Pet", icon: PawPrint, emoji: "🐾" },
  { id: 2, label: "Tutor & Contato", icon: User, emoji: "👤" },
  { id: 3, label: "Localização", icon: MapPin, emoji: "📍" },
  { id: 4, label: "Saúde & Extras", icon: Heart, emoji: "❤️" },
];

// ─── FieldWrapper ─────────────────────────────────────────────
const FW = ({
  label,
  required,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string | false;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-sm font-semibold text-foreground/80">
      {label}
      {required && <span className="text-primary ml-1">*</span>}
    </Label>
    {children}
    {hint && !error && (
      <p className="text-xs text-muted-foreground">{hint}</p>
    )}
    {error && (
      <p className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────
const CadastrarPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [foto, setFoto] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    sexo: "",
    dataNascimento: "",
    corPredominante: "",
    porte: "",
    castrado: "",
    microchip: "",
    nomeTutor: "",
    nomeTutor2: "",
    cpfTutor: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
  });

  // ── Photo Upload ──────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setErrors((p) => ({ ...p, foto: "Imagem deve ter no máximo 8MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFoto(reader.result as string);
      setErrors((p) => { const n = { ...p }; delete n.foto; return n; });
    };
    reader.readAsDataURL(file);
  };

  // ── Field Updates ──────────────────────────────────────────
  const set = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (touched[field]) {
      setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    }
  };

  const blur = (field: string) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const errs = validateAll();
    if (errs[field]) setErrors((p) => ({ ...p, [field]: errs[field] }));
    else setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  // ── Validation ────────────────────────────────────────────
  const validateAll = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!foto) e.foto = "Foto do pet é obrigatória";
    if (!formData.nome.trim()) e.nome = "Nome do pet é obrigatório";
    else if (formData.nome.trim().length < 2) e.nome = "Mínimo 2 caracteres";
    if (!formData.especie) e.especie = "Selecione a espécie";
    if (!formData.sexo) e.sexo = "Selecione o sexo";
    if (!formData.nomeTutor.trim()) e.nomeTutor = "Nome do tutor é obrigatório";
    else if (formData.nomeTutor.trim().length < 3) e.nomeTutor = "Mínimo 3 caracteres";
    if (!formData.cpfTutor) e.cpfTutor = "CPF é obrigatório";
    else if (!validateCPF(formData.cpfTutor)) e.cpfTutor = "CPF inválido";
    if (formData.telefone && formData.telefone.replace(/\D/g, "").length < 10)
      e.telefone = "Telefone incompleto";
    if (formData.dataNascimento && new Date(formData.dataNascimento) > new Date())
      e.dataNascimento = "Data não pode ser no futuro";
    return e;
  };

  const validateStep = (s: number): Record<string, string> => {
    const all = validateAll();
    const stepFields: Record<number, string[]> = {
      1: ["foto", "nome", "especie", "sexo", "dataNascimento"],
      2: ["nomeTutor", "cpfTutor", "telefone"],
      3: [],
      4: [],
    };
    return Object.fromEntries(
      Object.entries(all).filter(([k]) => stepFields[s]?.includes(k))
    );
  };

  // ── Navigation ────────────────────────────────────────────
  const goNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((p) => ({ ...p, ...stepErrors }));
      const touchedFields = Object.keys(stepErrors).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {}
      );
      setTouched((p) => ({ ...p, ...touchedFields }));
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(
        Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {})
      );
      setStep(1);
      return;
    }
    const petData: PetData = { ...formData, foto, registroId: generateId() };
    navigate("/documentos", { state: { pet: petData } });
  };

  // ── Progress ──────────────────────────────────────────────
  const filledRequired = [
    !!foto, !!formData.nome, !!formData.especie, !!formData.sexo,
    !!formData.nomeTutor, !!formData.cpfTutor,
  ].filter(Boolean).length;
  const progress = Math.round((filledRequired / 6) * 100);

  const fe = (field: string) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      {/* Header */}
      <header className="bg-background/90 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4 max-w-3xl">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold">
              Registrar<span className="text-primary">Pet</span>
            </span>
          </div>
          {/* Progress pill */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{filledRequired}</span>/6 obrigatórios
            </div>
            <div className="h-2 w-28 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            RG Digital Gratuito
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Cadastrar Meu Pet
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo e gere o RG Digital do seu pet em segundos.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-3 mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 sm:gap-3">
              <button
                type="button"
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${step === s.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105"
                    : step > s.id
                      ? "bg-primary/15 text-primary cursor-pointer hover:bg-primary/25"
                      : "bg-secondary/60 text-muted-foreground cursor-default"
                  }`}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <span>{s.emoji}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-4 sm:w-8 rounded-full transition-all duration-500 ${step > s.id ? "bg-primary" : "bg-secondary"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ══════════ STEP 1: Sobre o Pet ══════════ */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <SectionCard title="🐾 Sobre o Pet" subtitle="Dados importantes e características do seu pet.">

                {/* Photo Upload — Large & Beautiful */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative w-36 h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${errors.foto && touched.foto
                          ? "border-destructive bg-destructive/5"
                          : foto
                            ? "border-primary"
                            : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10"
                        }`}
                    >
                      {foto ? (
                        <>
                          <img src={foto} alt="Foto do pet" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-1">
                            <Camera className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Trocar</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Camera className="w-10 h-10 text-primary/50 group-hover:text-primary group-hover:scale-110 transition-all" />
                          <span className="text-xs text-muted-foreground mt-2 font-medium text-center px-2">
                            Foto do Pet<span className="text-primary"> *</span>
                          </span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {errors.foto && touched.foto && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                        <AlertCircle className="w-3 h-3" />
                        {errors.foto}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Upload className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Upload da foto</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma foto clara do rosto do seu pet. A foto aparecerá no RG Digital.
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Formatos: JPG, PNG, WEBP — Máx. 8MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit mx-auto sm:mx-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {foto ? "Trocar Foto" : "Escolher Foto"}
                    </Button>
                  </div>
                </div>

                {/* Pet Fields */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <FW label="Nome do Pet" required error={fe("nome")} className="sm:col-span-1">
                    <Input
                      placeholder="Ex: Rex, Bolinha..."
                      value={formData.nome}
                      onChange={(e) => set("nome", e.target.value)}
                      onBlur={() => blur("nome")}
                      className={fe("nome") ? "border-destructive" : ""}
                    />
                  </FW>
                  <FW label="Sexo" required error={fe("sexo")}>
                    <Select
                      value={formData.sexo}
                      onValueChange={(v) => { set("sexo", v); setTouched((p) => ({ ...p, sexo: true })); }}
                    >
                      <SelectTrigger className={fe("sexo") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Macho">♂ Macho</SelectItem>
                        <SelectItem value="Fêmea">♀ Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  </FW>
                  <FW label="Espécie" required error={fe("especie")}>
                    <Select
                      value={formData.especie}
                      onValueChange={(v) => { set("especie", v); setTouched((p) => ({ ...p, especie: true })); }}
                    >
                      <SelectTrigger className={fe("especie") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cachorro">🐶 Cachorro</SelectItem>
                        <SelectItem value="gato">🐱 Gato</SelectItem>
                        <SelectItem value="passaro">🐦 Pássaro</SelectItem>
                        <SelectItem value="roedor">🐹 Roedor</SelectItem>
                        <SelectItem value="outro">🐾 Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FW>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <FW label="Raça" hint="Deixe em branco se SRD">
                    <Input
                      placeholder="Ex: Labrador, SRD..."
                      value={formData.raca}
                      onChange={(e) => set("raca", e.target.value)}
                    />
                  </FW>
                  <FW label="Porte">
                    <Select value={formData.porte} onValueChange={(v) => set("porte", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Miniatura">Miniatura</SelectItem>
                        <SelectItem value="Pequeno">Pequeno</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Grande">Grande</SelectItem>
                        <SelectItem value="Gigante">Gigante</SelectItem>
                      </SelectContent>
                    </Select>
                  </FW>
                  <FW label="Castrado(a)">
                    <Select value={formData.castrado} onValueChange={(v) => set("castrado", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">✅ Sim</SelectItem>
                        <SelectItem value="Não">❌ Não</SelectItem>
                        <SelectItem value="A Verificar">❓ A Verificar</SelectItem>
                      </SelectContent>
                    </Select>
                  </FW>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FW label="Data de Nascimento" error={fe("dataNascimento")}>
                    <Input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => set("dataNascimento", e.target.value)}
                      onBlur={() => blur("dataNascimento")}
                      className={fe("dataNascimento") ? "border-destructive" : ""}
                    />
                  </FW>
                  <FW label="Cor / Pelagem" hint="Ex: Caramelo, Malhado...">
                    <Input
                      placeholder="Ex: Preto e Branco"
                      value={formData.corPredominante}
                      onChange={(e) => set("corPredominante", e.target.value)}
                    />
                  </FW>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════════ STEP 2: Tutor & Contato ══════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <SectionCard title="👤 Dados do Tutor" subtitle="Quem é responsável pelo pet?">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FW label="Nome do Tutor Principal" required error={fe("nomeTutor")}>
                    <Input
                      placeholder="Nome completo"
                      value={formData.nomeTutor}
                      onChange={(e) => set("nomeTutor", e.target.value)}
                      onBlur={() => blur("nomeTutor")}
                      className={fe("nomeTutor") ? "border-destructive" : ""}
                    />
                  </FW>
                  <FW label="Nome do 2º Tutor" hint="Opcional">
                    <Input
                      placeholder="Nome completo (opcional)"
                      value={formData.nomeTutor2}
                      onChange={(e) => set("nomeTutor2", e.target.value)}
                    />
                  </FW>
                  <FW label="CPF do Tutor" required error={fe("cpfTutor")}>
                    <Input
                      placeholder="000.000.000-00"
                      value={formData.cpfTutor}
                      onChange={(e) => set("cpfTutor", formatCPF(e.target.value))}
                      onBlur={() => blur("cpfTutor")}
                      className={fe("cpfTutor") ? "border-destructive" : ""}
                    />
                  </FW>
                  <FW label="Número de Microchip" hint="Se o pet tiver microchip">
                    <Input
                      placeholder="Ex: 985141000123456"
                      value={formData.microchip}
                      onChange={(e) => set("microchip", e.target.value)}
                    />
                  </FW>
                </div>
              </SectionCard>

              <SectionCard title="📞 Contato" subtitle="Dados para contato em caso de perda do pet.">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FW label="Celular / WhatsApp" error={fe("telefone")}>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => set("telefone", formatPhone(e.target.value))}
                      onBlur={() => blur("telefone")}
                      className={fe("telefone") ? "border-destructive" : ""}
                    />
                  </FW>
                  <FW label="E-mail" hint="Para receber o RG por email (em breve)">
                    <Input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={formData.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </FW>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════════ STEP 3: Localização ══════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <SectionCard title="📍 Naturalidade" subtitle="Onde o pet nasceu ou onde mora?">
                <div className="grid sm:grid-cols-3 gap-4">
                  <FW label="Estado (UF)" hint="Ex: SP, RJ, MG...">
                    <Input
                      placeholder="Ex: PI"
                      maxLength={2}
                      value={formData.estado}
                      onChange={(e) => set("estado", e.target.value.toUpperCase())}
                    />
                  </FW>
                  <FW label="Cidade" className="sm:col-span-2">
                    <Input
                      placeholder="Ex: Teresina"
                      value={formData.cidade}
                      onChange={(e) => set("cidade", e.target.value)}
                    />
                  </FW>
                  <FW label="Endereço completo" className="sm:col-span-3" hint="Rua, número, bairro — aparece no verso do RG como naturalidade">
                    <Input
                      placeholder="Ex: Rua das Flores, 123, Centro - Teresina - PI"
                      value={formData.endereco}
                      onChange={(e) => set("endereco", e.target.value)}
                    />
                  </FW>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════════ STEP 4: Saúde & Revisão ══════════ */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              {/* Resumo bonito */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  {foto ? (
                    <img
                      src={foto}
                      alt={formData.nome}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-primary/30 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center">
                      <PawPrint className="w-10 h-10 text-primary/50" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      Prévia do Cadastro
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-foreground">
                      {formData.nome || "—"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {formData.especie && `${formData.especie} • `}
                      {formData.raca || "SRD"} •{" "}
                      {formData.sexo || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    { label: "Tutor", value: formData.nomeTutor },
                    { label: "2º Tutor", value: formData.nomeTutor2 || "—" },
                    { label: "Celular", value: formData.telefone || "—" },
                    { label: "Cidade", value: formData.cidade ? `${formData.cidade}/${formData.estado}` : "—" },
                    { label: "Porte", value: formData.porte || "—" },
                    { label: "Castrado", value: formData.castrado || "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-background/60 rounded-xl p-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-0.5">
                        {item.label}
                      </span>
                      <span className="font-semibold text-foreground text-sm truncate block">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Erros gerais */}
              {Object.keys(validateAll()).length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">
                      Há campos obrigatórios não preenchidos
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      Volte para os steps anteriores e preencha: {" "}
                      {Object.keys(validateAll()).join(", ")}
                    </p>
                  </div>
                </div>
              )}

              <SectionCard title="✅ Tudo pronto?" subtitle="Revise os dados e clique em Gerar RG Digital.">
                <p className="text-sm text-muted-foreground">
                  Após clicar em <strong>"Gerar RG Digital"</strong>, você será redirecionado para a página do RG onde poderá baixar o PDF ou compartilhar o documento.
                </p>
              </SectionCard>
            </div>
          )}

          {/* ══════════ Navigation Buttons ══════════ */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {step > 1 ? (
              <Button type="button" variant="outline" size="lg" className="h-14 px-6" onClick={goBack}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            ) : (
              <div />
            )}
            {step < STEPS.length ? (
              <Button type="button" variant="hero" size="lg" className="h-14 px-8 flex-1 sm:flex-none" onClick={goNext}>
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="h-14 px-8 flex-1 sm:flex-none"
                disabled={Object.keys(validateAll()).length > 0}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Gerar RG Digital 🐾
              </Button>
            )}
          </div>
        </form>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground mt-8 pb-8">
          🔒 Seus dados são usados apenas para gerar o RG Digital do seu pet. Não armazenamos nenhuma informação.
        </p>
      </main>
    </div>
  );
};

// ─── Section Card ────────────────────────────────────────────
const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/60 space-y-5">
    <div>
      <h2 className="font-heading font-bold text-lg text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <div className="border-t border-border/50" />
    {children}
  </div>
);

export default CadastrarPage;
