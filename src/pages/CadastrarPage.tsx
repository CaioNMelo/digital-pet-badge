import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, AlertCircle, CheckCircle2 } from "lucide-react";

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

const generateId = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `PET-${now.toString(36).toUpperCase()}-${random.toString().padStart(4, "0")}`;
};

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(digits[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(digits[10]) === check;
};

interface FieldError {
  [key: string]: string;
}

const CadastrarPage = () => {
  const navigate = useNavigate();
  const [foto, setFoto] = useState<string>("");
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    sexo: "",
    dataNascimento: "",
    corPredominante: "",
    nomeTutor: "",
    cpfTutor: "",
    telefone: "",
    endereco: "",
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, foto: "A imagem deve ter no máximo 5MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
        setErrors((prev) => { const n = { ...prev }; delete n.foto; return n; });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): FieldError => {
    const errs: FieldError = {};
    if (!foto) errs.foto = "Foto do pet é obrigatória";
    if (!formData.nome.trim()) errs.nome = "Nome do pet é obrigatório";
    else if (formData.nome.trim().length < 2) errs.nome = "Nome deve ter pelo menos 2 caracteres";
    if (!formData.especie) errs.especie = "Selecione a espécie";
    if (!formData.sexo) errs.sexo = "Selecione o sexo";
    if (!formData.nomeTutor.trim()) errs.nomeTutor = "Nome do tutor é obrigatório";
    else if (formData.nomeTutor.trim().length < 3) errs.nomeTutor = "Nome deve ter pelo menos 3 caracteres";
    if (!formData.cpfTutor) errs.cpfTutor = "CPF é obrigatório";
    else if (!validateCPF(formData.cpfTutor)) errs.cpfTutor = "CPF inválido";
    if (formData.telefone && formData.telefone.replace(/\D/g, "").length < 10) errs.telefone = "Telefone incompleto";
    if (formData.dataNascimento) {
      const d = new Date(formData.dataNascimento);
      if (d > new Date()) errs.dataNascimento = "Data não pode ser no futuro";
    }
    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const allErrors = validate();
    if (allErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] }));
    } else {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      return;
    }
    const petData: PetData = { ...formData, foto, registroId: generateId() };
    navigate("/rg", { state: { pet: petData } });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      // Re-validate on change after touch
      const tempData = { ...formData, [field]: value };
      const tempErrors = { ...errors };
      // Simple inline re-validation for touched fields
      if (field === "nome" && value.trim().length >= 2) delete tempErrors.nome;
      if (field === "nomeTutor" && value.trim().length >= 3) delete tempErrors.nomeTutor;
      if (field === "cpfTutor" && validateCPF(value)) delete tempErrors.cpfTutor;
      setErrors(tempErrors);
    }
  };

  const fieldError = (field: string) => touched[field] && errors[field];

  const completedFields = [
    !!foto, !!formData.nome, !!formData.especie, !!formData.sexo,
    !!formData.nomeTutor, !!formData.cpfTutor
  ].filter(Boolean).length;
  const totalRequired = 6;
  const progress = Math.round((completedFields / totalRequired) * 100);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
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
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{completedFields}/{totalRequired}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Cadastrar Pet</h1>
          <p className="text-muted-foreground">Preencha os dados do seu pet para gerar o RG Digital.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <label
              htmlFor="pet-photo"
              className={`relative w-36 h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                fieldError("foto")
                  ? "border-destructive bg-destructive/5"
                  : foto
                  ? "border-primary bg-primary/5"
                  : "border-primary/30 bg-secondary/50 hover:border-primary hover:bg-primary/5"
              }`}
            >
              {foto ? (
                <>
                  <img src={foto} alt="Foto do pet" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "white" }} />
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground mt-1 font-medium">Foto do Pet *</span>
                </>
              )}
              <input id="pet-photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {fieldError("foto") && (
              <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.foto}</p>
            )}
          </div>

          {/* Pet Info */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-5">
            <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              🐾 Dados do Pet
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldWrapper label="Nome do Pet" required error={fieldError("nome") as string}>
                <Input
                  placeholder="Ex: Rex"
                  value={formData.nome}
                  onChange={(e) => updateField("nome", e.target.value)}
                  onBlur={() => handleBlur("nome")}
                  className={fieldError("nome") ? "border-destructive" : ""}
                />
              </FieldWrapper>
              <FieldWrapper label="Espécie" required error={fieldError("especie") as string}>
                <Select value={formData.especie} onValueChange={(v) => { updateField("especie", v); setTouched(p => ({...p, especie: true})); setErrors(p => { const n = {...p}; delete n.especie; return n; }); }}>
                  <SelectTrigger className={fieldError("especie") ? "border-destructive" : ""}>
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
              </FieldWrapper>
              <FieldWrapper label="Raça">
                <Input placeholder="Ex: Labrador" value={formData.raca} onChange={(e) => updateField("raca", e.target.value)} />
              </FieldWrapper>
              <FieldWrapper label="Sexo" required error={fieldError("sexo") as string}>
                <Select value={formData.sexo} onValueChange={(v) => { updateField("sexo", v); setTouched(p => ({...p, sexo: true})); setErrors(p => { const n = {...p}; delete n.sexo; return n; }); }}>
                  <SelectTrigger className={fieldError("sexo") ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">♂ Macho</SelectItem>
                    <SelectItem value="femea">♀ Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="Data de Nascimento" error={fieldError("dataNascimento") as string}>
                <Input type="date" value={formData.dataNascimento} onChange={(e) => updateField("dataNascimento", e.target.value)} onBlur={() => handleBlur("dataNascimento")} className={fieldError("dataNascimento") ? "border-destructive" : ""} />
              </FieldWrapper>
              <FieldWrapper label="Cor Predominante">
                <Input placeholder="Ex: Caramelo" value={formData.corPredominante} onChange={(e) => updateField("corPredominante", e.target.value)} />
              </FieldWrapper>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-5">
            <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              👤 Dados do Tutor
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldWrapper label="Nome do Tutor" required error={fieldError("nomeTutor") as string}>
                <Input placeholder="Nome completo" value={formData.nomeTutor} onChange={(e) => updateField("nomeTutor", e.target.value)} onBlur={() => handleBlur("nomeTutor")} className={fieldError("nomeTutor") ? "border-destructive" : ""} />
              </FieldWrapper>
              <FieldWrapper label="CPF" required error={fieldError("cpfTutor") as string}>
                <Input placeholder="000.000.000-00" value={formData.cpfTutor} onChange={(e) => updateField("cpfTutor", formatCPF(e.target.value))} onBlur={() => handleBlur("cpfTutor")} className={fieldError("cpfTutor") ? "border-destructive" : ""} />
              </FieldWrapper>
              <FieldWrapper label="Telefone" error={fieldError("telefone") as string}>
                <Input placeholder="(00) 00000-0000" value={formData.telefone} onChange={(e) => updateField("telefone", formatPhone(e.target.value))} onBlur={() => handleBlur("telefone")} className={fieldError("telefone") ? "border-destructive" : ""} />
              </FieldWrapper>
              <FieldWrapper label="Endereço" className="sm:col-span-2">
                <Input placeholder="Rua, número, bairro, cidade" value={formData.endereco} onChange={(e) => updateField("endereco", e.target.value)} />
              </FieldWrapper>
            </div>
          </div>

          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Corrija os erros acima</p>
                <p className="text-xs text-destructive/80 mt-0.5">Preencha todos os campos obrigatórios para continuar.</p>
              </div>
            </div>
          )}

          <Button type="submit" variant="hero" size="xl" className="w-full">
            {progress === 100 ? <CheckCircle2 className="w-5 h-5" /> : "🐾"} Gerar RG Digital do Pet
          </Button>
        </form>
      </main>
    </div>
  );
};

const FieldWrapper = ({ label, required, error, children, className }: {
  label: string; required?: boolean; error?: string | false; children: React.ReactNode; className?: string;
}) => (
  <div className={`space-y-1.5 ${className || ""}`}>
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

export default CadastrarPage;
