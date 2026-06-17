import React from 'react';
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Gift,
  Loader2,
  MapPin,
  Search,
  Star,
  Ticket,
  Trophy,
  Truck,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, getCurrentUser, refreshCurrentUserFromBackend } from "../lib/api";
import type { CanjeResponse, Premio, UsuarioSesion } from "../lib/api";

const formatDate = (value: string) => {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const requiereEnvio = (premio: Premio) => premio.envioDomicilio?.toUpperCase() === "S";

export function PremiosCiudadano() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getCurrentUser());
  const [premios, setPremios] = useState<Premio[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [canjeandoId, setCanjeandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<CanjeResponse | null>(null);

  const cargarPremios = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await api.premios();
      setPremios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los premios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPremios();

    refreshCurrentUserFromBackend()
      .then((updated) => {
        if (updated) setUsuario(updated);
      })
      .catch(() => setUsuario(getCurrentUser()));
  }, []);

  const premiosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return premios;

    return premios.filter((premio) =>
      `${premio.nombre} ${premio.descripcion} ${
        requiereEnvio(premio) ? "envio domicilio casa" : "retiro sin envio"
      }`
        .toLowerCase()
        .includes(term)
    );
  }, [premios, search]);

  const handleCanjear = async (premio: Premio) => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      setError("Debes iniciar sesión para canjear premios.");
      return;
    }

    if (requiereEnvio(premio) && !currentUser.direccion?.trim()) {
      setError("Este premio requiere envío a domicilio. Completa tu dirección en el perfil antes de canjearlo.");
      return;
    }

    setError("");
    setSuccess(null);
    setCanjeandoId(premio.id);

    try {
      const response = await api.canjearPremio(premio.id, currentUser.id);

      setSuccess(response);
      setUsuario({ ...currentUser, puntos: response.puntosRestantes });

      await cargarPremios();

      const updated = await refreshCurrentUserFromBackend();
      if (updated) setUsuario(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo realizar el canje.");
    } finally {
      setCanjeandoId(null);
    }
  };

  const puntosUsuario = usuario?.puntos ?? 0;
  const direccionUsuario = usuario?.direccion?.trim() ?? "";
  const premiosDisponibles = premios.filter((premio) => premio.stock > 0).length;

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen">
      <div className="bg-gradient-to-r from-[#3d5a47] to-[#6fae7f] rounded-2xl p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Premios y canjes</h1>
              <p className="opacity-90">
                Canjea tus puntos por beneficios disponibles en EcoConce.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="rounded-xl bg-white/15 px-4 py-3 border border-white/10 backdrop-blur-xs">
              <p className="text-sm opacity-80">Tus eco-puntos actuales</p>
              <p className="text-2xl font-bold">
                {puntosUsuario.toLocaleString("es-CL")} pts
              </p>
            </div>

            <div className="rounded-xl bg-white/15 px-4 py-3 border border-white/10 backdrop-blur-xs">
              <p className="text-sm opacity-80">Premios disponibles</p>
              <p className="text-2xl font-bold">{premiosDisponibles}</p>
            </div>
          </div>
        </div>

        <Gift className="absolute right-8 bottom-4 w-40 h-40 opacity-20 hidden md:block" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50 shadow-xs">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Canje generado correctamente
                </p>

                <h2 className="text-2xl font-bold text-green-900">
                  {success.premio}
                </h2>

                <p className="text-sm text-green-800 mt-1">
                  Código de canje:{" "}
                  <span className="font-mono bg-green-100 px-2 py-0.5 rounded-sm font-bold">{success.codigoCanje}</span>
                </p>

                <p className="text-xs text-green-700 mt-1">
                  Fecha: {formatDate(success.fechaCanje)}
                </p>

                {success.envioDomicilio === "S" && (
                  <div className="mt-4 rounded-lg border border-green-300 bg-white/70 p-3 text-sm text-green-900">
                    <div className="flex items-start gap-2">
                      <Truck className="w-5 h-5 mt-0.5 text-green-700" />

                      <div>
                        <p className="font-medium">Este premio tiene envío a domicilio.</p>
                        <p className="mt-1">
                          Será enviado a la dirección registrada en tu perfil:
                        </p>
                        <p className="font-semibold mt-1">
                          {success.direccionEnvio ?? "Dirección no disponible"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Badge className="bg-green-700 text-white text-sm px-4 py-2">
                {success.estado}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d4437]">
            Catálogo de premios
          </h2>
          <p className="text-gray-600">
            Elige y canjea tus premios favoritos con los puntos acumulados por reciclar.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar premio..."
            className="pl-10 bg-white border-gray-200"
          />
        </div>
      </div>

      {loading ? (
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-8 text-center text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#3d5a47]" />
            Cargando premios disponibles...
          </CardContent>
        </Card>
      ) : premiosFiltrados.length === 0 ? (
        <Card className="border-[#6fae7f]/20">
          <CardContent className="p-8 text-center text-gray-600">
            No hay premios disponibles con ese filtro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {premiosFiltrados.map((premio) => {
            const sinStock = premio.stock <= 0;
            const puntosInsuficientes = puntosUsuario < premio.costoPuntos;
            const conEnvio = requiereEnvio(premio);
            const faltaDireccion = conEnvio && !direccionUsuario;
            const disabled =
              sinStock ||
              puntosInsuficientes ||
              faltaDireccion ||
              canjeandoId === premio.id;

            return (
              <Card
                key={premio.id}
                className="border-[#6fae7f]/20 hover:shadow-lg transition bg-white flex flex-col justify-between hover:-translate-y-0.5 duration-200"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#3d5a47] flex-shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={
                            sinStock
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                          }
                          variant="outline"
                        >
                          {sinStock ? "Agotado" : `Quedan ${premio.stock} premios disponibles`}
                        </Badge>

                        {conEnvio && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" variant="outline">
                            <Truck className="w-3.5 h-3.5 mr-1" />
                            Envío a domicilio
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-[#2d4437] text-xl mt-4">
                      {premio.nombre}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 min-h-12">
                      {premio.descripcion}
                    </p>

                    <div className="flex items-center justify-between rounded-xl bg-[#f5f7f5] p-3">
                      <div className="flex items-center gap-2 text-[#2d4437]">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">
                          {premio.costoPuntos.toLocaleString("es-CL")} pts
                        </span>
                      </div>

                      <span className="text-xs text-gray-500 font-medium">
                        Costo del canje
                      </span>
                    </div>

                    {conEnvio && direccionUsuario && (
                      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-800">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          <div>
                            <p className="font-semibold">Envío a tu domicilio:</p>
                            <p className="mt-0.5 text-gray-600 truncate max-w-[220px]" title={direccionUsuario}>
                              {direccionUsuario}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {conEnvio && !direccionUsuario && (
                      <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-3 text-xs text-amber-800">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                          <div>
                            <p className="font-semibold">Requiere envío a domicilio.</p>
                            <p className="mt-0.5">
                              Debes ingresar tu dirección en tu perfil antes de canjear.
                            </p>
                            <Link
                              to="/ciudadano/perfil"
                              className="inline-block mt-1 font-semibold text-amber-900 underline hover:text-amber-950"
                            >
                              Completar dirección
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {puntosInsuficientes && !sinStock && (
                      <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                        Te faltan{" "}
                        {(premio.costoPuntos - puntosUsuario).toLocaleString("es-CL")}{" "}
                        puntos para canjearlo.
                      </p>
                    )}
                  </CardContent>
                </div>

                <div className="p-6 pt-0">
                  <Button
                    className={`w-full ${
                      disabled
                        ? "bg-gray-100 text-gray-400 border border-gray-200"
                        : "bg-[#3d5a47] hover:bg-[#2d4437] text-white"
                    }`}
                    disabled={disabled}
                    onClick={() => handleCanjear(premio)}
                  >
                    {canjeandoId === premio.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Ticket className="w-4 h-4 mr-2" />
                    )}

                    {sinStock
                      ? "Sin stock"
                      : puntosInsuficientes
                        ? "Puntos insuficientes"
                        : faltaDireccion
                          ? "Completa tu dirección"
                          : "Canjear premio"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}