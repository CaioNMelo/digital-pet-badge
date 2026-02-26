import { Shield, Search, FileText, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroPets from "@/assets/hero-pets.png";

const features = [
  {
    icon: Shield,
    title: "Segurança",
    description: "Tenha os dados do seu pet sempre à mão para emergências e identificação rápida.",
  },
  {
    icon: Search,
    title: "Identificação",
    description: "Em caso de perda, o RG Digital facilita a identificação e o retorno do seu pet.",
  },
  {
    icon: FileText,
    title: "Organização",
    description: "Todas as informações do seu pet organizadas em um único documento digital.",
  },
  {
    icon: Heart,
    title: "Cuidado",
    description: "Demonstre amor e responsabilidade registrando oficialmente seu companheiro.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold text-foreground">
              Registrar<span className="text-primary">Pet</span>
            </span>
          </div>
          <Button variant="hero" size="sm" onClick={() => navigate("/cadastrar")}>
            Cadastrar meu Pet
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
              <span>🐾</span> RG Digital para seu Pet
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground leading-tight">
              Seu pet merece uma{" "}
              <span className="text-primary">identidade</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Cadastre seu pet e gere um RG Digital personalizado com foto, dados e QR Code.
              Segurança e organização na palma da sua mão.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/cadastrar")}>
                🐾 Cadastrar meu Pet
              </Button>
              <Button variant="outline" size="xl" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Saiba mais
              </Button>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
            <img
              src={heroPets}
              alt="Cachorro e gato felizes"
              className="relative rounded-3xl shadow-xl w-full max-w-md mx-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/50 px-4">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Por que registrar seu pet?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            O registro digital do seu pet traz inúmeros benefícios para você e seu companheiro.
          </p>
        </div>
        <div className="container mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 text-center group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 md:p-16 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Pronto para registrar seu pet?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              É rápido, fácil e gratuito. Gere o RG Digital do seu pet em poucos minutos.
            </p>
            <Button variant="warm" size="xl" onClick={() => navigate("/cadastrar")}>
              🐾 Cadastrar agora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t px-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2026 RegistrarPet. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
