import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import sigurd from "@/assets/sigurd.png";
import { ArrowRight, Joystick } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <div className="h-screen flex flex-row items-center justify-center">
        <div className="flex flex-col h-full justify-center max-w-2xl">
          <h1 className="text-5xl font-bold text-primary flex items-center gap-4">
            Dette er Sigurd
            <ArrowRight className="w-20 h-20 text-primary animate-pulse" />
          </h1>
          <p className="text-xl text-muted-foreground">
            Sigurd er en entreprenør på jakt etter neste store suksess. Men
            først må han navigere gjennom byråkratiet og finne veien til
            finansiering.
          </p>
          <div className="pt-4">
            <Link to="/game">
              <Button
                size="lg"
                className="bg-primary hover:bg-accent hover:text-white text-slate-900 px-12 py-6 text-xl font-bold rounded-xl transform transition-all duration-300"
              >
                Start Spillet
                <Joystick className="w-10 h-10 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <img
          src={sigurd}
          width={500}
          height={500}
          alt="Sigurd Startup"
          className="object-cover"
        />
      </div>

      {/* Story Timeline */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="text-primary">Reisen til Sigurd</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-primary via-accent to-primary/30 hidden lg:block"></div>

            <div className="space-y-16">
              {/* The Dream */}
              <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                <div className="lg:text-right space-y-4">
                  <div className="inline-block bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2 border border-primary/30">
                    <span className="text-primary font-mono text-sm tracking-wider">
                      KAPITTEL 01
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    Drømmen
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Det var en gang, en ung gründer ved navn Sigurd. Med øyne
                    fulle av ambisjoner og et hjerte som brant for innovasjon,
                    drømte Sigurd om å skape noe revolusjonerende som skulle
                    forandre verden.
                  </p>
                  <blockquote className="mt-4 pl-4 border-l-4 border-primary/50 italic text-primary/90">
                    "Dette blir lett," tenkte han naivt, mens han registrerte
                    sitt AS for 30.000 kroner. "Om seks måneder er jeg
                    milliardær!"
                  </blockquote>
                </div>
                <div className="lg:hidden mt-8 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>

              {/* The Struggle */}
              <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                <div className="hidden lg:flex justify-center" />
                <div className="space-y-4">
                  <div className="inline-block bg-accent/20 backdrop-blur-sm rounded-full px-6 py-2 border border-accent/30">
                    <span className="text-accent font-mono text-sm tracking-wider">
                      KAPITTEL 02
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Kampen</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Men det norske byråkratiske labyrinten hadde andre planer.
                    Hvert steg fremover krevde tre skjemaer, to tillatelser og
                    en komitégodkjenning. Sigurd fant seg selv hoppende gjennom
                    endeløse byråkratiske bøyler, unngikk rødt-bånd-bomber, og
                    desperat samlet finansieringsmynter.
                  </p>
                  <blockquote className="mt-4 pl-4 border-l-4 border-accent/50 italic text-accent/90">
                    "Mva på mva? Arbeidsgiveravgift på kaffe?!" ropte han mens
                    skatte-spøkelser jaget ham gjennom korridorene hos
                    Innovasjon Norge.
                  </blockquote>
                </div>
                <div className="lg:hidden mt-8 w-full h-1 bg-gradient-to-r from-accent/50 to-transparent"></div>
              </div>

              {/* The Mission */}
              <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                <div className="lg:text-right space-y-4">
                  <div className="inline-block bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2 border border-primary/30">
                    <span className="text-primary font-mono text-sm tracking-wider">
                      KAPITTEL 03
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    Oppdraget
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nå trenger Sigurd din hjelp! Veileid ham gjennom det
                    farefulle landskapet av norsk entreprenørskap. Samle
                    finansiering for å holde drømmene hans i live, unngå de
                    byråkratiske hindringene som truer med å avslutte hans
                    reise, og hjelp ham nå nye høyder av suksess. Men advarsel:
                    Jo lenger Sigurd overlever i det norske startup-økosystemet,
                    jo mer kynisk blir han. Fra naiv optimist til erfaren
                    gründer som vet at "pivot" ikke handler om basketball, og at
                    "burn rate" faktisk brenner.
                  </p>
                </div>

                <div className="lg:hidden mt-8 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20 pt-16 border-t border-border/50">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                Klar til å Hjelpe Sigurd?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hopp inn i den actionfylte verdenen av norsk entreprenørskap.
                Hver krone betyr noe og hver beslutning former fremtiden. Vil du
                være helten som hjelper Sigurd å overleve det norske
                startup-marerittet? Eller vil han drukne i et hav av
                skatterapporter og reguleringsforskrifter?
              </p>
              <Link to="/game">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-accent hover:text-white text-slate-900 px-12 py-6 text-xl font-bold rounded-xl transform transition-all duration-300 mt-4"
                >
                  SPILL NÅ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
