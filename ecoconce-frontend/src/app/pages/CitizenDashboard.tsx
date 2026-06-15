import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { api, Dashboard, getDemoUserId } from "../lib/api";
import {
  Recycle,
  TrendingUp,
  Trophy,
  Target,
  MapPin,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Star,
  Navigation,
  X,
  Loader2,
} from "lucide-react";
import {
  calcularDistanciaMetros,
  formatDistance,
  getStoredLocation,
  GPS_UPDATED_EVENT,
  markGpsPromptDismissed,
  refreshLocationIfAllowed,
  requestUserLocation,
  shouldShowGpsPrompt,
  tieneCoordenadasValidas,
  UserLocation,
} from "../lib/gps";

export function CitizenDashboard() {
  const [gpsEnabled, setGpsEnabled] = useState(Boolean(getStoredLocation()));
  const [showGpsPrompt, setShowGpsPrompt] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => getStoredLocation());
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard(getDemoUserId())
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard"));
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncLocation = () => {
      const stored = getStoredLocation();
      if (!mounted) return;
      setUserLocation(stored);
      setGpsEnabled(Boolean(stored));
      if (stored) setShowGpsPrompt(false);
    };

    syncLocation();

    shouldShowGpsPrompt().then((show) => {
      if (mounted) setShowGpsPrompt(show);
    });

    refreshLocationIfAllowed()
      .then((location) => {
        if (!mounted || !location) return;
        setUserLocation(location);
        setGpsEnabled(true);
        setShowGpsPrompt(false);
      })
      .catch(() => {
        // Si el navegador no permite refrescar ubicación sin interacción, se mantiene el estado actual.
      });

    window.addEventListener(GPS_UPDATED_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);
    return () => {
      mounted = false;
      window.removeEventListener(GPS_UPDATED_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  const activarGps = async () => {
    setGpsError("");
    setGpsLoading(true);
    try {
      const location = await requestUserLocation();
      setUserLocation(location);
      setGpsEnabled(true);
      setShowGpsPrompt(false);
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : "No se pudo activar el GPS.");
      setGpsEnabled(false);
      setShowGpsPrompt(true);
    } finally {
      setGpsLoading(false);
    }
  };

  const dismissGpsPrompt = () => {
    markGpsPromptDismissed();
    setShowGpsPrompt(false);
  };

  const resumen = dashboard?.resumen;
  const usuario = dashboard?.usuario;
  const puntos = dashboard?.puntos ?? [];
  const medallas = dashboard?.medallas ?? [];
  const guias = dashboard?.guias ?? [];

  const stats = [
    { label: "Materiales reciclados", value: resumen?.materialesReciclados ?? 0, icon: Recycle, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Puntos ganados", value: resumen?.puntosGanados ?? usuario?.puntos ?? 0, icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { label: "Formularios aprobados", value: resumen?.desafiosCompletados ?? 0, icon: Target, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Nivel actual", value: resumen?.nivelesGanados ?? 1, icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const puntosActuales = usuario?.puntos ?? 0;
  const siguienteNivel = Math.max(5000, Math.ceil((puntosActuales + 1) / 5000) * 5000);
  const progreso = Math.min(100, Math.round((puntosActuales / siguienteNivel) * 100));

  const puntosCercanos = useMemo(() => {
    const puntosConDistancia = puntos.map((point) => {
      if (!userLocation || !tieneCoordenadasValidas(point)) return point;
      return {
        ...point,
        distanciaRealM: calcularDistanciaMetros(
          userLocation.latitud,
          userLocation.longitud,
          Number(point.latitud),
          Number(point.longitud)
        ),
      };
    });

    if (!userLocation) return puntosConDistancia.slice(0, 3);

    return [...puntosConDistancia]
      .sort((a, b) => {
        const distanciaA = "distanciaRealM" in a ? Number(a.distanciaRealM) : Number.POSITIVE_INFINITY;
        const distanciaB = "distanciaRealM" in b ? Number(b.distanciaRealM) : Number.POSITIVE_INFINITY;
        return distanciaA - distanciaB;
      })
      .slice(0, 3);
  }, [puntos, userLocation]);

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen">
      {showGpsPrompt && !gpsEnabled && (
        <Card className="border-[#3d5a47] bg-gradient-to-r from-[#6fae7f]/10 to-[#3d5a47]/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#3d5a47] rounded-full flex items-center justify-center flex-shrink-0">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2d4437] mb-2">Activa tu ubicación</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Permite el acceso a tu ubicación para mostrar los puntos de reciclaje más cercanos. Si ya diste permiso, EcoConce lo recordará y no volverá a mostrar este aviso.
                </p>
                {gpsError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{gpsError}</div>}
                <div className="flex gap-3">
                  <Button onClick={activarGps} disabled={gpsLoading} className="bg-[#3d5a47] hover:bg-[#2d4437]">
                    {gpsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                    Activar GPS
                  </Button>
                  <Button variant="outline" onClick={dismissGpsPrompt} className="border-gray-300">Ahora no</Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={dismissGpsPrompt} className="flex-shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gpsEnabled && userLocation && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center justify-between gap-3">
          <span>
            GPS activo. Los puntos cercanos se ordenan usando tu ubicación real con precisión aprox. {userLocation.precisionM} m.
          </span>
          <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={activarGps} disabled={gpsLoading}>
            {gpsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
            Actualizar
          </Button>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-gradient-to-r from-[#3d5a47] to-[#6fae7f] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">¡Hola {usuario?.nombreAlias ?? "Usuario"}! 👋</h1>
          <p className="text-lg opacity-90">
            Aquí tienes tu resumen de actividad conectado al backend de EcoConce.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/ciudadano/mapa">
              <Button className="bg-white text-[#3d5a47] hover:bg-gray-100">
                Ver Mapa de Puntos <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/ciudadano/formularios">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#3d5a47]">
                Informar reciclaje
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <Recycle className="w-48 h-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-[#6fae7f]/20 hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2d4437]">{Number(stat.value).toLocaleString("es-CL")}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-[#6fae7f]/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#2d4437] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" /> Medallas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {medallas.map((medal) => (
                  <div key={medal.nombre} className={`relative p-4 rounded-xl border-2 text-center ${medal.obtenida ? "border-[#6fae7f] bg-green-50" : "border-gray-200 bg-gray-50 opacity-70"}`}>
                    {medal.obtenida && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#3d5a47]">Obtenida</Badge>}
                    <div className="text-4xl mb-2">{medal.icono}</div>
                    <p className="font-bold text-sm text-[#2d4437] mb-1">{medal.nombre}</p>
                    <p className="text-xs text-gray-600">{medal.puntosRequeridos.toLocaleString("es-CL")} pts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/ciudadano/mapa" className="block">
              <Card className="border-[#6fae7f]/20 hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#6fae7f]/10 rounded-full flex items-center justify-center mx-auto mb-3"><MapPin className="w-6 h-6 text-[#3d5a47]" /></div>
                  <p className="font-medium text-[#2d4437]">Buscar Puntos</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/ciudadano/formularios" className="block">
              <Card className="border-[#6fae7f]/20 hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#6fae7f]/10 rounded-full flex items-center justify-center mx-auto mb-3"><ClipboardList className="w-6 h-6 text-[#3d5a47]" /></div>
                  <p className="font-medium text-[#2d4437]">Informar reciclaje</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/ciudadano/guias" className="block">
              <Card className="border-[#6fae7f]/20 hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#6fae7f]/10 rounded-full flex items-center justify-center mx-auto mb-3"><BookOpen className="w-6 h-6 text-[#3d5a47]" /></div>
                  <p className="font-medium text-[#2d4437]">Ver Guías</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-[#6fae7f]/20">
            <CardHeader><CardTitle className="text-[#2d4437]">Guías destacadas</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {guias.slice(0, 4).map((guia) => (
                <div key={guia.id} className="p-4 bg-white rounded-lg border border-[#6fae7f]/20">
                  <p className="font-bold text-[#2d4437]">{guia.titulo}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{guia.descripcion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-[#6fae7f]/20 bg-gradient-to-br from-white to-[#f5f7f5]">
            <CardHeader><CardTitle className="text-[#2d4437] flex items-center gap-2"><Target className="w-5 h-5 text-[#3d5a47]" />Tu Progreso</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-[#2d4437]">Puntos actuales</span>
                  <span className="text-sm text-gray-600">{puntosActuales.toLocaleString("es-CL")} / {siguienteNivel.toLocaleString("es-CL")}</span>
                </div>
                <Progress value={progreso} className="h-3" />
                <p className="text-xs text-gray-600 mt-2">{progreso}% hacia la siguiente meta</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#6fae7f]/20">
            <CardHeader><CardTitle className="text-[#2d4437] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#3d5a47]" />Puntos de reciclaje</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {puntosCercanos.map((point) => (
                <div key={point.id} className="p-4 bg-[#f5f7f5] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-[#2d4437]">{point.nombre}</p>
                      <p className="text-sm text-gray-600">{point.direccion}</p>
                      {"distanciaRealM" in point && point.distanciaRealM !== undefined && (
                        <p className="text-xs text-green-700 mt-1">A {formatDistance(Number(point.distanciaRealM))} de tu ubicación</p>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">{point.estado}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {point.materiales.map((material) => <Badge key={material} variant="outline" className="text-xs border-[#6fae7f]">{material}</Badge>)}
                  </div>
                </div>
              ))}
              <Link to="/ciudadano/mapa"><Button variant="outline" size="sm" className="w-full border-[#3d5a47] text-[#3d5a47] hover:bg-[#3d5a47] hover:text-white">Ver Mapa Completo</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
