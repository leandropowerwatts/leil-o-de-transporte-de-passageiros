import { useState } from "react";
import { useLocation } from "wouter";
import { useApp, UserRole } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { login, registerUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginRole, setLoginRole] = useState<UserRole>("client");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("client");
  const [regCarModel, setRegCarModel] = useState("");
  const [regCarPlate, setRegCarPlate] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      login(loginEmail, loginRole);
      setIsLoading(false);
      setLocation("/"); // Context will handle redirect based on role
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      registerUser({
        id: "", // will be set by context
        name: regName,
        email: regEmail,
        role: regRole,
        phone: regPhone,
        carModel: regRole === "driver" ? regCarModel : undefined,
        carPlate: regRole === "driver" ? regCarPlate : undefined,
      });
      setIsLoading(false);
      // Switch to login tab or auto-login
      login(regEmail, regRole);
      setLocation("/");
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md mx-auto glass-panel">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo</CardTitle>
          <CardDescription className="text-center">
            Entre ou crie sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de conta</Label>
                  <Select value={loginRole} onValueChange={(v) => setLoginRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Passageiro</SelectItem>
                      <SelectItem value="driver">Motorista</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                
                <div className="text-xs text-center text-muted-foreground mt-4 p-2 bg-muted/50 rounded">
                  <p>Credenciais Demo:</p>
                  <p>Admin: pastorleocardoso@gmail.com</p>
                  <p>Passageiro: maria@email.com</p>
                  <p>Motorista: joao@email.com</p>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nome</Label>
                    <Input id="reg-name" value={regName} onChange={e => setRegName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Celular</Label>
                    <Input id="reg-phone" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-role">Quero ser</Label>
                  <Select value={regRole} onValueChange={(v) => setRegRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Passageiro</SelectItem>
                      <SelectItem value="driver">Motorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {regRole === "driver" && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="space-y-2">
                      <Label htmlFor="car-model">Modelo do Carro</Label>
                      <Input id="car-model" placeholder="Ex: Gol 1.0" value={regCarModel} onChange={e => setRegCarModel(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="car-plate">Placa</Label>
                      <Input id="car-plate" placeholder="ABC-1234" value={regCarPlate} onChange={e => setRegCarPlate(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input id="reg-password" type="password" required />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
