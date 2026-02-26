import { Shield, Search, FileText, Heart, ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroPets from "@/assets/hero-pets.png";

const features = [
  {
    icon: Shield,
    title: "Segurança",
    description: "Tenha os dados do seu pet sempre à mão para emergências e identificação rápida.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    title: "Identificação",
    description: "Em caso de perda, o RG Digital facilita a identificação e o retorno seguro do seu pet.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FileText,
    title: "Organização",
    description: "Todas as informações do seu pet organizadas em um único documento digital oficial.",
    color: "bg-warm/10 text-warm",
  },
  {
    icon: Heart,
    title: "Cuidado",
    description: "Demonstre amor e responsabilidade registrando oficialmente seu companheiro.",
    color: "bg-primary/10 text-primary",
  },
];

const steps = [
  { num: "1", title: "Preencha os dados", desc: "Informe os dados do pet e do tutor responsável." },
  { num: "2", title: "Envie uma foto", desc: "Faça upload de uma foto bonita do seu pet." },
  { num: "3", title: "Gere o RG Digital", desc: "Baixe o documento em PDF ou compartilhe." },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">
              Registrar<span className="text-primary">Pet</span>
            </span>
          </div>
          <Button variant="hero" size="sm" className="animate-button-pulse hover:animate-none" onClick={() => navigate("/cadastrar")}>
            Cadastrar meu Pet
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <PawPrint className="w-4 h-4" /> RG Digital para seu Pet
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground leading-[1.1]">
              Seu pet merece uma{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                identidade oficial
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Cadastre seu pet e gere um <strong className="text-foreground">RG Digital personalizado</strong> com foto,
              dados completos e QR Code. Segurança, organização e cuidado na palma da sua mão.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" className="animate-button-pulse hover:animate-none" onClick={() => navigate("/cadastrar")}>
                Cadastrar meu Pet <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => {
                document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Como funciona?
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">✅ Gratuito</span>
              <span className="flex items-center gap-1.5">⚡ Em 2 minutos</span>
              <span className="flex items-center gap-1.5">📱 100% Digital</span>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/15 rounded-[2rem] blur-3xl scale-110" />
            <img
              src={heroPets}
              alt="Cachorro e gato felizes representando o registro de pets"
              className="relative rounded-[2rem] shadow-2xl w-full max-w-md mx-auto object-cover border-4 border-background"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 md:left-4 bg-card rounded-2xl shadow-xl px-5 py-3 border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Seguro</p>
                <p className="text-xs text-muted-foreground">Dados protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-muted/50 px-4">
        <div className="container mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            Como funciona?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Em apenas 3 passos simples, seu pet terá um documento digital oficial.
          </p>
        </div>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 max-w-4xl">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-5 text-2xl font-heading font-black shadow-lg">
                {step.num}
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-7 -right-4 w-5 h-5 text-primary/30" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            Por que registrar seu pet?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            O registro digital do seu pet traz inúmeros benefícios para você e seu companheiro.
          </p>
        </div>
        <div className="container mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 text-center group hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="relative overflow-hidden rounded-[2rem] p-12 md:p-20" style={{ background: "linear-gradient(135deg, hsl(168 55% 38%), hsl(200 70% 45%))" }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)" }} />
            <div className="relative">
              <PawPrint className="w-12 h-12 mx-auto mb-6 opacity-80" style={{ color: "white" }} />
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" style={{ color: "white" }}>
                Pronto para registrar seu pet?
              </h2>
              <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
                É rápido, fácil e gratuito. Gere o RG Digital do seu pet em poucos minutos.
              </p>
              <Button variant="warm" size="xl" className="animate-button-pulse hover:animate-none" onClick={() => navigate("/cadastrar")}>
                Cadastrar agora <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-foreground">RegistrarPet</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 RegistrarPet. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
