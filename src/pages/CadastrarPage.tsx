import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera } from "lucide-react";

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
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const CadastrarPage = () => {
  const navigate = useNavigate();
  const [foto, setFoto] = useState<string>("");
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
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const petData: PetData = {
      ...formData,
      foto,
      registroId: generateId(),
    };
    navigate("/rg", { state: { pet: petData } });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = formData.nome && foto && formData.especie && formData.sexo && formData.nomeTutor && formData.cpfTutor.replace(/\D/g, "").length === 11;

  return (
    <div className="min-h-screen bg-background">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Cadastrar Pet</h1>
          <p className="text-muted-foreground">Preencha os dados do seu pet para gerar o RG Digital.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-4">
            <label
              htmlFor="pet-photo"
              className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden group"
            >
              {foto ? (
                <img src={foto} alt="Foto do pet" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground mt-1">Foto do Pet</span>
                </>
              )}
              <input id="pet-photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {!foto && <p className="text-xs text-muted-foreground">Clique para enviar a foto</p>}
          </div>

          {/* Pet Info */}
          <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              🐾 Dados do Pet
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Pet *</Label>
                <Input id="nome" placeholder="Ex: Rex" value={formData.nome} onChange={(e) => updateField("nome", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Espécie *</Label>
                <Select value={formData.especie} onValueChange={(v) => updateField("especie", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cachorro">🐶 Cachorro</SelectItem>
                    <SelectItem value="gato">🐱 Gato</SelectItem>
                    <SelectItem value="passaro">🐦 Pássaro</SelectItem>
                    <SelectItem value="roedor">🐹 Roedor</SelectItem>
                    <SelectItem value="outro">🐾 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="raca">Raça</Label>
                <Input id="raca" placeholder="Ex: Labrador" value={formData.raca} onChange={(e) => updateField("raca", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sexo *</Label>
                <Select value={formData.sexo} onValueChange={(v) => updateField("sexo", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="femea">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nascimento">Data de Nascimento</Label>
                <Input id="nascimento" type="date" value={formData.dataNascimento} onChange={(e) => updateField("dataNascimento", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor">Cor Predominante</Label>
                <Input id="cor" placeholder="Ex: Caramelo" value={formData.corPredominante} onChange={(e) => updateField("corPredominante", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              👤 Dados do Tutor
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tutor">Nome do Tutor *</Label>
                <Input id="tutor" placeholder="Nome completo" value={formData.nomeTutor} onChange={(e) => updateField("nomeTutor", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={formData.cpfTutor} onChange={(e) => updateField("cpfTutor", formatCPF(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(00) 00000-0000" value={formData.telefone} onChange={(e) => updateField("telefone", formatPhone(e.target.value))} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua, número, bairro, cidade" value={formData.endereco} onChange={(e) => updateField("endereco", e.target.value)} />
              </div>
            </div>
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={!isValid}>
            🐾 Gerar RG Digital do Pet
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CadastrarPage;
