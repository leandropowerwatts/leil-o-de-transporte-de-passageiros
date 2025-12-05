import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useApp, Message } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, AlertTriangle, Check, X, Car, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function RideNegotiation() {
  const [, params] = useRoute("/ride/:id");
  const rideId = params?.id;
  const { rides, currentUser, messages, sendMessage, offers, acceptOffer, rejectOffer, confirmRide, cancelRide } = useApp();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const ride = rides.find(r => r.id === rideId);
  const rideMessages = messages.filter(m => m.rideId === rideId).sort((a, b) => a.timestamp - b.timestamp);
  const rideOffers = offers.filter(o => o.rideId === rideId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [rideMessages.length]);

  if (!ride || !currentUser) return <div className="p-8 text-center">Viagem não encontrada</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(rideId!, inputText);
    setInputText("");
  };

  const isClient = currentUser.role === "client";
  const isDriver = currentUser.role === "driver";

  // Determine if this user is involved in this ride
  // Client: Owns the ride
  // Driver: Has made an offer OR is the confirmed driver
  const isParticipant = 
    (isClient && ride.clientId === currentUser.id) ||
    (isDriver && (ride.driverId === currentUser.id || rideOffers.some(o => o.driverId === currentUser.id)));

  // If driver hasn't made an offer yet and ride is not confirmed, redirect or show limited view
  // For simplicity, we assume they arrive here via dashboard link after making offer or if open

  const myOffer = isDriver ? rideOffers.find(o => o.driverId === currentUser.id) : null;
  const acceptedOffer = rideOffers.find(o => o.status === "accepted");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Panel: Ride Info & Offers */}
      <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-y-auto">
        <Card className="shrink-0">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle>Detalhes da Viagem</CardTitle>
              <Badge className={ride.status === 'confirmed' ? 'bg-green-500' : 'bg-blue-500'}>
                {ride.status === 'pending' ? 'Aguardando' : 
                 ride.status === 'negotiating' ? 'Em Negociação' :
                 ride.status === 'confirmed' ? 'Confirmada' : ride.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2">
              <div>
                <span className="text-muted-foreground text-xs">Origem</span>
                <p className="font-medium">{ride.origin}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Destino</span>
                <p className="font-medium">{ride.destination}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Oferta Inicial</span>
                <p className="font-bold text-lg">R$ {ride.offerPrice.toFixed(2)}</p>
              </div>
            </div>

            {ride.status !== 'cancelled' && ride.status !== 'completed' && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => {
                  if (confirm("Tem certeza que deseja cancelar esta viagem?")) {
                    cancelRide(ride.id);
                  }
                }}
              >
                Cancelar Viagem
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Offers List (Only visible to Client, or Driver sees only their own status) */}
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold mb-2 px-1">Propostas</h3>
          {rideOffers.length === 0 ? (
             <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
               Nenhuma proposta ainda.
             </div>
          ) : (
            <div className="space-y-3">
              {rideOffers.map(offer => {
                // If driver, only show my offer unless confirmed
                if (isDriver && offer.driverId !== currentUser.id && ride.status !== 'confirmed') return null;

                return (
                  <Card key={offer.id} className={`
                    transition-all 
                    ${offer.status === 'accepted' ? 'border-green-500 bg-green-50/10 shadow-md' : ''}
                    ${offer.status === 'rejected' ? 'opacity-50 bg-gray-100/5' : ''}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{offer.driverName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Car className="w-3 h-3" /> {offer.carModel} • {offer.carPlate}
                          </div>
                        </div>
                        <span className="text-xl font-bold text-green-600">R$ {offer.amount}</span>
                      </div>

                      {/* Actions for Client */}
                      {isClient && offer.status === 'pending' && ride.status !== 'confirmed' && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => acceptOffer(offer.id)}
                          >
                            <Check className="w-4 h-4 mr-1" /> Aceitar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-red-500 hover:bg-red-50"
                            onClick={() => rejectOffer(offer.id)}
                          >
                            <X className="w-4 h-4 mr-1" /> Recusar
                          </Button>
                        </div>
                      )}

                      {/* Status Badges */}
                      {offer.status === 'accepted' && (
                        <div className="mt-2 p-2 bg-green-500/10 text-green-500 rounded text-xs font-medium text-center border border-green-500/20">
                          Proposta Aceita - Aguardando Motorista
                        </div>
                      )}
                      {offer.status === 'rejected' && (
                        <div className="mt-2 text-red-500 text-xs text-center">Proposta Recusada</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Chat Area */}
      <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 py-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.clientName}`} />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">Chat da Viagem</CardTitle>
              <CardDescription className="text-xs">
                {isClient ? "Negocie com os motoristas" : `Conversando com ${ride.clientName}`}
              </CardDescription>
            </div>
          </div>
          
          {/* Driver Confirmation Button */}
          {isDriver && myOffer?.status === 'accepted' && ride.status !== 'confirmed' && (
            <Button onClick={() => confirmRide(ride.id)} className="animate-pulse bg-green-600 hover:bg-green-700">
              Confirmar Viagem
            </Button>
          )}
          
          {/* Confirmed Status Banner */}
          {ride.status === 'confirmed' && (
            <Badge className="bg-green-600 text-white px-3 py-1">Viagem Confirmada</Badge>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative bg-slate-50/50 dark:bg-slate-950/50">
          <ScrollArea className="h-full p-4">
             {rideMessages.length === 0 ? (
               <div className="flex h-full items-center justify-center text-muted-foreground opacity-50">
                 <p>Inicie a conversa ou aguarde propostas...</p>
               </div>
             ) : (
               <div className="space-y-4 pb-4">
                 {rideMessages.map((msg) => {
                   const isMe = msg.senderId === currentUser.id;
                   const isSystem = msg.isSystem;

                   if (isSystem) {
                     return (
                       <div key={msg.id} className="flex justify-center my-4">
                         <div className="bg-muted text-xs text-muted-foreground px-3 py-1 rounded-full border flex items-center gap-1.5">
                           <AlertTriangle className="w-3 h-3" />
                           {msg.text}
                         </div>
                       </div>
                     );
                   }

                   return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`
                         max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm
                         ${isMe 
                           ? 'bg-primary text-primary-foreground rounded-br-none' 
                           : 'bg-white dark:bg-slate-800 border rounded-bl-none'}
                       `}>
                         {!isMe && <p className="text-[10px] opacity-70 mb-1">{msg.senderName}</p>}
                         <p>{msg.text}</p>
                         <span className="text-[10px] opacity-50 block text-right mt-1">
                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       </div>
                     </div>
                   );
                 })}
                 <div ref={scrollRef} />
               </div>
             )}
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="p-3 bg-background border-t">
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input 
              placeholder="Digite sua mensagem..." 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={ride.status === 'cancelled' || ride.status === 'completed'}
              className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full"
              disabled={!inputText.trim() || ride.status === 'cancelled' || ride.status === 'completed'}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
