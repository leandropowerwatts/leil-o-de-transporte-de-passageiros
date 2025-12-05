import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

export type UserRole = "client" | "driver" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  carModel?: string;
  carPlate?: string;
  isBlocked?: boolean;
}

export interface Ride {
  id: string;
  clientId: string;
  clientName: string;
  origin: string;
  destination: string;
  offerPrice: number;
  status: "pending" | "negotiating" | "confirmed" | "completed" | "cancelled";
  driverId?: string;
  driverName?: string;
  carModel?: string;
  carPlate?: string;
  finalPrice?: number;
  createdAt: number;
}

export interface Offer {
  id: string;
  rideId: string;
  driverId: string;
  driverName: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
  carModel: string;
  carPlate: string;
}

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  rides: Ride[];
  offers: Offer[];
  messages: Message[];
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  registerUser: (user: User) => void;
  createRide: (ride: Omit<Ride, "id" | "createdAt" | "status" | "clientName">) => void;
  cancelRide: (rideId: string) => void;
  makeOffer: (rideId: string, amount: number) => void;
  acceptOffer: (offerId: string) => void;
  rejectOffer: (offerId: string) => void;
  confirmRide: (rideId: string) => void;
  sendMessage: (rideId: string, text: string) => void;
  toggleBlockUser: (userId: string) => void;
  isAdmin: boolean;
}

// --- Mock Data ---

const MOCK_ADMIN: User = {
  id: "admin-1",
  name: "Leandro",
  email: "pastorleocardoso@gmail.com",
  role: "admin",
  phone: "15981677695",
};

const INITIAL_USERS: User[] = [
  MOCK_ADMIN,
  { id: "u1", name: "Maria Silva", email: "maria@email.com", role: "client", phone: "11999999999" },
  { id: "d1", name: "João Souza", email: "joao@email.com", role: "driver", phone: "11888888888", carModel: "VW Jetta", carPlate: "ABC-1234" },
  { id: "d2", name: "Pedro Santos", email: "pedro@email.com", role: "driver", phone: "11777777777", carModel: "Honda Civic", carPlate: "XYZ-9876" },
];

// --- Context ---

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [rides, setRides] = useState<Ride[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  // Cleanup old data (mocking the 15 days rule)
  useEffect(() => {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    setRides(prev => prev.filter(r => r.createdAt > fifteenDaysAgo));
  }, []);

  const login = (email: string, role: UserRole) => {
    const user = users.find(u => u.email === email && u.role === role);
    if (user) {
      if (user.isBlocked) {
        toast({ title: "Acesso negado", description: "Sua conta está bloqueada.", variant: "destructive" });
        return;
      }
      setCurrentUser(user);
      toast({ title: `Bem-vindo, ${user.name}!` });
    } else {
      // For prototype simplicity, auto-register if not found (or show error)
      // Let's show error to force registration flow or use mock credentials
      toast({ title: "Usuário não encontrado", description: "Verifique suas credenciais.", variant: "destructive" });
    }
  };

  const logout = () => setCurrentUser(null);

  const registerUser = (newUser: User) => {
    setUsers([...users, { ...newUser, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: "Cadastro realizado!", description: "Faça login para continuar." });
  };

  const createRide = (rideData: Omit<Ride, "id" | "createdAt" | "status" | "clientName">) => {
    if (!currentUser) return;
    const newRide: Ride = {
      ...rideData,
      id: Math.random().toString(36).substr(2, 9),
      clientName: currentUser.name,
      status: "pending",
      createdAt: Date.now(),
    };
    setRides([newRide, ...rides]);
    toast({ title: "Viagem solicitada!", description: "Aguardando motoristas..." });
    
    // Notify drivers (Mock)
    setTimeout(() => {
      toast({ title: "Nova solicitação", description: `Viagem de ${newRide.origin} para ${newRide.destination}` });
    }, 1000);
  };

  const makeOffer = (rideId: string, amount: number) => {
    if (!currentUser || currentUser.role !== "driver") return;
    
    const ride = rides.find(r => r.id === rideId);
    if (!ride) return;

    const newOffer: Offer = {
      id: Math.random().toString(36).substr(2, 9),
      rideId,
      driverId: currentUser.id,
      driverName: currentUser.name,
      carModel: currentUser.carModel || "",
      carPlate: currentUser.carPlate || "",
      amount,
      status: "pending",
    };
    
    setOffers([...offers, newOffer]);
    
    // Update ride status to negotiating if it was pending
    setRides(rides.map(r => r.id === rideId ? { ...r, status: "negotiating" } : r));
    
    // Send system message
    addSystemMessage(rideId, `Proposta de R$ ${amount} recebida de ${currentUser.name} (${currentUser.carModel})`);
    toast({ title: "Proposta enviada!" });
  };

  const acceptOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: "accepted" } : o));
    
    // Notify driver
    addSystemMessage(offer.rideId, `Proposta de ${offer.driverName} aceita pelo passageiro. Aguardando confirmação do motorista.`);
    toast({ title: "Proposta aceita", description: "Aguarde a confirmação do motorista." });
  };
  
  const rejectOffer = (offerId: string) => {
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: "rejected" } : o));
  };

  const confirmRide = (rideId: string) => {
    // Driver confirms
    if (!currentUser || currentUser.role !== 'driver') return;

    const acceptedOffer = offers.find(o => o.rideId === rideId && o.driverId === currentUser.id && o.status === "accepted");
    
    if (!acceptedOffer) return;

    setRides(rides.map(r => r.id === rideId ? { 
      ...r, 
      status: "confirmed", 
      driverId: currentUser.id, 
      driverName: currentUser.name,
      finalPrice: acceptedOffer.amount,
      carModel: currentUser.carModel,
      carPlate: currentUser.carPlate
    } : r));

    addSystemMessage(rideId, `Viagem confirmada! Motorista ${currentUser.name} (${currentUser.carPlate}) está a caminho.`);
    toast({ title: "Viagem confirmada!" });
  };

  const cancelRide = (rideId: string) => {
    setRides(rides.map(r => r.id === rideId ? { ...r, status: "cancelled" } : r));
    addSystemMessage(rideId, `Viagem cancelada por ${currentUser?.name}`);
    toast({ title: "Viagem cancelada" });
  };

  const sendMessage = (rideId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      rideId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: Date.now(),
    };
    setMessages([...messages, newMessage]);
  };

  const addSystemMessage = (rideId: string, text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      rideId,
      senderId: "system",
      senderName: "Sistema",
      text,
      timestamp: Date.now(),
      isSystem: true,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleBlockUser = (userId: string) => {
    if (currentUser?.role !== 'admin') return;
    setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    toast({ title: "Status do usuário atualizado" });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      rides,
      offers,
      messages,
      login,
      logout,
      registerUser,
      createRide,
      cancelRide,
      makeOffer,
      acceptOffer,
      rejectOffer,
      confirmRide,
      sendMessage,
      toggleBlockUser,
      isAdmin: currentUser?.role === 'admin'
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
