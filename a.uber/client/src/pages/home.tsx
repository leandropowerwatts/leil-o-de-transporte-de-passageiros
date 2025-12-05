import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowRight, Car, Shield, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import generatedImage from '@assets/generated_images/abstract_neon_city_map_background_for_ride-sharing_app.png';

export default function Home() {
  const { currentUser } = useApp();
  const [, setLocation] = useLocation();

  if (currentUser) {
    // Redirect based on role
    if (currentUser.role === "client") setLocation("/client");
    else if (currentUser.role === "driver") setLocation("/driver");
    else if (currentUser.role === "admin") setLocation("/admin");
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
         <img 
           src={generatedImage}
           alt="Background" 
           className="w-full h-full object-cover opacity-20 dark:opacity-30"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-6">
            Sua viagem, <br />
            <span className="text-primary">seu preço.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            O app de transporte onde você define o valor. Negocie diretamente com motoristas e viaje com economia e segurança.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register?role=client">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20">
              Quero viajar <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/register?role=driver">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5">
              Quero ser motorista
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left"
        >
          <FeatureCard 
            icon={<User className="w-6 h-6 text-primary" />}
            title="Passageiro define"
            description="Sugira quanto quer pagar pela viagem e receba propostas."
          />
          <FeatureCard 
            icon={<Car className="w-6 h-6 text-primary" />}
            title="Motorista negocia"
            description="Aceite o valor ou faça uma contraproposta justa."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Segurança total"
            description="Monitoramento em tempo real e motoristas verificados."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
      <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
