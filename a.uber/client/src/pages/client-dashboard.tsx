import { useState } from "react";
import { useApp, Ride } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Navigation, Car } from "lucide-react";
import { Link } from "wouter";

export default function ClientDashboard() {
  const { currentUser, createRide, rides } = useApp();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [price, setPrice] = useState("");

  const myRides = rides.filter(r => r.clientId === currentUser?.id).sort((a, b) => b.createdAt - a.createdAt);
  const activeRide = myRides.find(r => ["pending", "negotiating", "confirmed"].includes(r.status));

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createRide({
      clientId: currentUser!.id,
      origin,
      destination,
      offerPrice: Number(price),
    });
    setOrigin("");
    setDestination("");
    setPrice("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {currentUser?.name}</h1>
          <p className="text-muted-foreground">Para onde vamos hoje?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Ride Form */}
        <Card className="lg:col-span-1 h-fit glass-panel">
          <CardHeader>
            <CardTitle>Nova Corrida</CardTitle>
            <CardDescription>Defina seu trajeto e o valor.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-2">
                <Label>Origem</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9" 
                    placeholder="Onde você está?" 
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Destino</Label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9" 
                    placeholder="Para onde quer ir?" 
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sua Oferta (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9" 
                    type="number" 
                    placeholder="20.00" 
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full size-lg text-base" disabled={!!activeRide}>
                {activeRide ? "Você já tem uma corrida ativa" : "Solicitar Motoristas"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rides List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Suas Viagens</h2>
          
          {myRides.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed bg-muted/30">
              <p className="text-muted-foreground">Nenhuma viagem registrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRides.map(ride => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RideCard({ ride }: { ride: Ride }) {
  const isActive = ["pending", "negotiating", "confirmed"].includes(ride.status);
  
  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    negotiating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusLabels = {
    pending: "Aguardando",
    negotiating: "Negociando",
    confirmed: "Confirmada",
    completed: "Finalizada",
    cancelled: "Cancelada",
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isActive ? 'border-primary/50 shadow-sm' : 'opacity-70'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[ride.status]}>
                {statusLabels[ride.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(ride.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium">{ride.origin}</span>
              </div>
              <div className="w-0.5 h-3 bg-border ml-[3px]" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-medium">{ride.destination}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor ofertado</p>
              <p className="text-2xl font-bold font-mono">R$ {ride.finalPrice || ride.offerPrice}</p>
            </div>
            
            {isActive && (
              <Link href={`/ride/${ride.id}`}>
                <Button>
                  {ride.status === "pending" ? "Verificar Propostas" : "Ir para Negociação"}
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {ride.driverName && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3 text-sm">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span>Motorista: <span className="font-medium">{ride.driverName}</span></span>
            {ride.carModel && <Badge variant="secondary" className="ml-auto font-mono">{ride.carModel} • {ride.carPlate}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
