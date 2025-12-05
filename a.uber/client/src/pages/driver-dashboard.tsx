import { useState } from "react";
import { useApp, Ride } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, DollarSign, Navigation, User, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";

export default function DriverDashboard() {
  const { currentUser, rides, makeOffer, offers } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [offerAmounts, setOfferAmounts] = useState<Record<string, string>>({});

  // Filter rides: 
  // 1. Status is pending or negotiating
  // 2. Not created by me (obviously)
  // 3. Show my accepted rides in a separate section
  const availableRides = rides.filter(r => 
    ["pending", "negotiating"].includes(r.status) && 
    (!r.driverId || r.driverId === currentUser?.id) // Show if no driver assigned or assigned to me
  ).sort((a, b) => b.createdAt - a.createdAt);

  const myActiveRides = rides.filter(r => 
    ["confirmed"].includes(r.status) && 
    r.driverId === currentUser?.id
  );

  const handleMakeOffer = (rideId: string, defaultAmount: number) => {
    const amount = offerAmounts[rideId] ? Number(offerAmounts[rideId]) : defaultAmount;
    makeOffer(rideId, amount);
  };

  const hasMadeOffer = (rideId: string) => {
    return offers.some(o => o.rideId === rideId && o.driverId === currentUser?.id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, Motorista {currentUser?.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <span>{isOnline ? "Você está online e visível" : "Você está offline"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-card p-2 rounded-full border shadow-sm">
          <Label htmlFor="online-mode" className="pl-2 cursor-pointer">Disponível</Label>
          <Switch id="online-mode" checked={isOnline} onCheckedChange={setIsOnline} />
        </div>
      </div>

      {/* Active Rides */}
      {myActiveRides.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-green-600">
            <Navigation className="w-5 h-5" /> Viagens em Andamento
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myActiveRides.map(ride => (
              <Card key={ride.id} className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{ride.clientName}</h3>
                      <p className="text-sm text-muted-foreground">Viagem Confirmada</p>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white text-lg px-3 py-1">
                      R$ {ride.finalPrice}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">{ride.origin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{ride.destination}</span>
                    </div>
                  </div>

                  <Link href={`/ride/${ride.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Ver Detalhes / Chat
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Rides Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Corridas Disponíveis</h2>
        
        {!isOnline ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Fique online para ver novas solicitações.</p>
            </CardContent>
          </Card>
        ) : availableRides.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Nenhuma corrida disponível no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableRides.map(ride => {
              const offered = hasMadeOffer(ride.id);
              
              return (
                <Card key={ride.id} className={`transition-all hover:shadow-md ${offered ? 'border-primary/40 bg-primary/5' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-base">{ride.clientName}</CardTitle>
                      </div>
                      <Badge variant={offered ? "secondary" : "outline"}>
                        {offered ? "Proposta Enviada" : "Novo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{ride.origin}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{ride.destination}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Oferta do Cliente</span>
                      <span className="font-bold text-lg">R$ {ride.offerPrice}</span>
                    </div>

                    {!offered && (
                      <div className="grid gap-2">
                        <Label htmlFor={`offer-${ride.id}`} className="text-xs">Sua Contraproposta (Opcional)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                          <Input 
                            id={`offer-${ride.id}`}
                            className="h-8 pl-6" 
                            placeholder={`Sugerir outro valor (mín R$${ride.offerPrice})`}
                            value={offerAmounts[ride.id] || ""}
                            onChange={e => setOfferAmounts({...offerAmounts, [ride.id]: e.target.value})}
                            type="number"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 gap-2">
                    {offered ? (
                      <Link href={`/ride/${ride.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          Ver Negociação
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleMakeOffer(ride.id, ride.offerPrice)}
                      >
                        Aceitar / Enviar Proposta
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
