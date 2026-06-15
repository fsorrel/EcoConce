import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Recycle } from "lucide-react";
import { api, BdRow, getRolePath, saveCurrentUser } from "../lib/api";


export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const usuarios = await api.usuarios();
      const usuario = usuarios.find((item: BdRow) => String(item.correo).toLowerCase() === email.toLowerCase());
      if (!usuario) throw new Error("No existe un usuario registrado con ese correo");
      if (String(usuario.contrasena) !== password) throw new Error("Contraseña incorrecta");
      const usuarioSesion = saveCurrentUser(usuario as Record<string, unknown>);
      navigate(getRolePath(usuarioSesion));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7f5] to-[#e8ede9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#3d5a47] rounded-full flex items-center justify-center">
              <Recycle className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#3d5a47]">EcoConce</span>
          </Link>
          <p className="text-gray-600">Bienvenido de vuelta</p>
        </div>

        <Card className="border-[#6fae7f]/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-[#2d4437]">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300"
                />
              </div>
              <Button disabled={loading} type="submit" className="w-full bg-[#3d5a47] hover:bg-[#2d4437]">
                {loading ? "Validando..." : "Ingresar"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿No tienes una cuenta? </span>
              <Link to="/registro" className="text-[#3d5a47] hover:underline font-medium">
                Regístrate aquí
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3">Demo conectada al backend</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Button type="button" variant="outline" size="sm" onClick={() => { setEmail("jordan@ecoconce.cl"); setPassword("1234"); }} className="text-[#3d5a47] border-[#3d5a47]/30">Ciudadano</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setEmail("admin@ecoconce.cl"); setPassword("1234"); }} className="text-[#3d5a47] border-[#3d5a47]/30">Admin</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setEmail("mantenedor@ecoconce.cl"); setPassword("1234"); }} className="text-[#3d5a47] border-[#3d5a47]/30">Mantenedor</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
