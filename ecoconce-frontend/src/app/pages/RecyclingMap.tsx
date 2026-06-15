import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { api, PuntoReciclaje } from "../lib/api";
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  Filter,
  MapPinned,
  Loader2,
  LocateFixed,
  Route,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  calcularDistanciaMetros,
  formatDistance,
  getStoredLocation,
  GPS_UPDATED_EVENT,
  requestUserLocation,
  tieneCoordenadasValidas,
  UserLocation,
} from "../lib/gps";

declare global {
  interface Window {
    google?: any;
  }
}

const RAW_GOOGLE_MAPS_API_KEY = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();
const USE_GOOGLE_JS_MAPS = String(import.meta.env.VITE_GOOGLE_MAPS_USE_JS ?? "false").toLowerCase() === "true";
const GOOGLE_MAPS_API_KEY =
  RAW_GOOGLE_MAPS_API_KEY &&
  !RAW_GOOGLE_MAPS_API_KEY.toUpperCase().includes("TU_API_KEY") &&
  !RAW_GOOGLE_MAPS_API_KEY.toUpperCase().includes("GOOGLE_MAPS")
    ? RAW_GOOGLE_MAPS_API_KEY
    : "";
const CONCEPCION_CENTER = { lat: -36.82699, lng: -73.04977 };
let googleMapsPromise: Promise<any> | null = null;

const loadGoogleMaps = () => {
  if (!USE_GOOGLE_JS_MAPS || !GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps JavaScript API está desactivado. Se usará el mapa compatible de Google Maps."));
  }

  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-ecoconce-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps.")));
      return;
    }

    const script = document.createElement("script");
    script.dataset.ecoconceGoogleMaps = "true";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&language=es&region=CL`;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps. Revisa la API key y las APIs habilitadas."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

const statusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("colaps")) return "bg-red-500";
  if (normalized.includes("congest") || normalized.includes("lleno")) return "bg-yellow-500";
  if (normalized.includes("inactivo")) return "bg-gray-400";
  return "bg-green-500";
};

type PuntoConDistancia = PuntoReciclaje & {
  distanciaRealM?: number;
};

const mapsDestinationUrl = (point: PuntoReciclaje, userLocation?: UserLocation | null) => {
  const destino = `${Number(point.latitud)},${Number(point.longitud)}`;
  const origen = userLocation ? `&origin=${userLocation.latitud},${userLocation.longitud}` : "";
  return `https://www.google.com/maps/dir/?api=1${origen}&destination=${destino}&travelmode=driving`;
};

const buildGoogleMapsEmbedUrl = (point?: PuntoReciclaje | null, userLocation?: UserLocation | null, showRoute = false) => {
  if (point && tieneCoordenadasValidas(point)) {
    const destino = `${Number(point.latitud)},${Number(point.longitud)}`;
    if (showRoute && userLocation) {
      const origen = `${userLocation.latitud},${userLocation.longitud}`;
      return `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(origen)}&daddr=${encodeURIComponent(destino)}&dirflg=d`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(destino)}&z=15&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent("Concepción, Biobío, Chile")}&z=13&output=embed`;
};

export function RecyclingMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const pointMarkersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [gpsEnabled, setGpsEnabled] = useState(Boolean(getStoredLocation()));
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => getStoredLocation());
  const [points, setPoints] = useState<PuntoReciclaje[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<PuntoConDistancia | null>(null);
  const [error, setError] = useState("");
  const [mapsError, setMapsError] = useState("");
  const [mapsReady, setMapsReady] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState("");
  const [showRouteInFallbackMap, setShowRouteInFallbackMap] = useState(false);

  useEffect(() => {
    api.puntos()
      .then(setPoints)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los puntos"));
  }, []);

  useEffect(() => {
    const syncLocation = () => {
      const stored = getStoredLocation();
      setUserLocation(stored);
      setGpsEnabled(Boolean(stored));
    };

    window.addEventListener(GPS_UPDATED_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);
    return () => {
      window.removeEventListener(GPS_UPDATED_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  const activarGps = useCallback(async () => {
    setGpsError("");
    setGpsLoading(true);
    try {
      const ubicacion = await requestUserLocation();
      setUserLocation(ubicacion);
      setGpsEnabled(true);
      return ubicacion;
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : "No se pudo activar la ubicación.");
      setGpsEnabled(false);
      return null;
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const puntosConDistancia = useMemo<PuntoConDistancia[]>(() => {
    const enriched: PuntoConDistancia[] = points.map((point) => {
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

    if (!userLocation) return enriched;

    return [...enriched].sort((a, b) => {
      const distanciaA = a.distanciaRealM ?? Number.POSITIVE_INFINITY;
      const distanciaB = b.distanciaRealM ?? Number.POSITIVE_INFINITY;
      return distanciaA - distanciaB;
    });
  }, [points, userLocation]);

  const filters = useMemo(() => {
    const names = new Set<string>();
    points.forEach((point) => point.materiales.forEach((material) => names.add(material)));
    return Array.from(names).map((nombre) => ({ id: nombre.toLowerCase(), label: nombre }));
  }, [points]);

  const filteredPoints = useMemo(() => {
    return puntosConDistancia.filter((point) => {
      const text = `${point.nombre} ${point.direccion} ${point.comuna}`.toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());
      const matchesMaterial =
        selectedFilters.length === 0 ||
        point.materiales.some((material) => selectedFilters.includes(material.toLowerCase()));
      return matchesSearch && matchesMaterial;
    });
  }, [puntosConDistancia, searchQuery, selectedFilters]);

  const puntoMasCercano = userLocation ? filteredPoints.find((point) => point.distanciaRealM !== undefined) : null;

  useEffect(() => {
    if (!USE_GOOGLE_JS_MAPS) {
      setMapsError("");
      setMapsReady(false);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setMapsError("La API key de Google Maps no está configurada. Se usará el mapa compatible sin romper la página.");
      setMapsReady(false);
      return;
    }

    let mounted = true;
    loadGoogleMaps()
      .then(async (google) => {
        if (!mounted || !mapContainerRef.current || mapRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: userLocation ? { lat: userLocation.latitud, lng: userLocation.longitud } : CONCEPCION_CENTER,
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          clickableIcons: true,
        });

        let DirectionsService = google.maps.DirectionsService;
        let DirectionsRenderer = google.maps.DirectionsRenderer;
        if (google.maps.importLibrary) {
          try {
            const routesLibrary = await google.maps.importLibrary("routes");
            DirectionsService = routesLibrary.DirectionsService ?? DirectionsService;
            DirectionsRenderer = routesLibrary.DirectionsRenderer ?? DirectionsRenderer;
          } catch {
            // Se mantiene el fallback clásico si importLibrary no responde.
          }
        }

        mapRef.current = map;
        directionsServiceRef.current = new DirectionsService();
        directionsRendererRef.current = new DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#2d4437",
            strokeWeight: 6,
            strokeOpacity: 0.85,
          },
        });
        setMapsReady(true);
        setMapsError("");
      })
      .catch((err) => {
        setMapsReady(false);
        setMapsError(err instanceof Error ? err.message : "No se pudo cargar Google Maps. Se usará el mapa compatible.");
      });

    return () => {
      mounted = false;
    };
  }, [userLocation]);

  useEffect(() => {
    const google = window.google;
    const map = mapRef.current;
    if (!mapsReady || !google?.maps || !map) return;

    pointMarkersRef.current.forEach((marker) => marker.setMap(null));
    pointMarkersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoint = false;

    filteredPoints.forEach((point) => {
      if (!tieneCoordenadasValidas(point)) return;
      const position = { lat: Number(point.latitud), lng: Number(point.longitud) };
      const marker = new google.maps.Marker({
        position,
        map,
        title: point.nombre,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: selectedPoint?.id === point.id ? 11 : 8,
          fillColor: point.estado.toLowerCase().includes("lleno") ? "#eab308" : "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      marker.addListener("click", () => {
        setSelectedPoint(point);
        map.panTo(position);
      });

      pointMarkersRef.current.push(marker);
      bounds.extend(position);
      hasPoint = true;
    });

    if (userLocation) {
      const position = { lat: userLocation.latitud, lng: userLocation.longitud };
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      userMarkerRef.current = new google.maps.Marker({
        position,
        map,
        title: "Tu ubicación",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        },
      });
      bounds.extend(position);
      hasPoint = true;
    }

    if (hasPoint && !routeInfo) {
      map.fitBounds(bounds, 70);
    }
  }, [filteredPoints, mapsReady, routeInfo, selectedPoint?.id, userLocation]);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
    );
  };

  const iframeMapUrl = useMemo(() => buildGoogleMapsEmbedUrl(selectedPoint, userLocation, showRouteInFallbackMap), [selectedPoint, showRouteInFallbackMap, userLocation]);

  const abrirEnGoogleMaps = (point: PuntoReciclaje) => {
    window.open(mapsDestinationUrl(point, userLocation), "_blank", "noopener,noreferrer");
  };

  const mostrarRutaAuto = async (point: PuntoConDistancia) => {
    setSelectedPoint(point);
    setRouteInfo("");
    setShowRouteInFallbackMap(false);

    let origen = userLocation;
    if (!origen) {
      origen = await activarGps();
    }

    if (!origen) return;

    if (!USE_GOOGLE_JS_MAPS || !mapsReady || !directionsServiceRef.current || !directionsRendererRef.current || !window.google?.maps) {
      setShowRouteInFallbackMap(true);
      setRouteInfo(`Ruta en auto hacia ${point.nombre} cargada en el mapa. También puedes abrirla en Google Maps.`);
      return;
    }

    setRouteLoading(true);
    directionsServiceRef.current.route(
      {
        origin: { lat: origen.latitud, lng: origen.longitud },
        destination: { lat: Number(point.latitud), lng: Number(point.longitud) },
        travelMode: window.google.maps.TravelMode.DRIVING,
        region: "CL",
      },
      (result: any, status: string) => {
        setRouteLoading(false);
        if (status === "OK" && result) {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          setRouteInfo(
            leg?.distance?.text && leg?.duration?.text
              ? `Ruta en auto hacia ${point.nombre}: ${leg.distance.text}, aprox. ${leg.duration.text}.`
              : `Ruta en auto hacia ${point.nombre} cargada.`
          );
        } else {
          setGpsError("No se pudo calcular la ruta en auto dentro del mapa. Abrí Google Maps en una pestaña nueva.");
          abrirEnGoogleMaps(point);
        }
      }
    );
  };

  return (
    <div className="h-full flex">
      <div className="w-[420px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#2d4437] mb-4">Mapa de Reciclaje</h1>
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {gpsError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{gpsError}</div>}
          {mapsError && USE_GOOGLE_JS_MAPS && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 flex gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>{mapsError}</span>
            </div>
          )}

          {!gpsEnabled ? (
            <div className="mb-4 p-3 bg-[#6fae7f]/10 rounded-lg border border-[#6fae7f]/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Navigation className="w-5 h-5 text-[#3d5a47]" />
                  <p className="text-sm text-gray-700">Activa tu ubicación real para ordenar los ecopuntos por cercanía</p>
                </div>
                <Button size="sm" onClick={activarGps} disabled={gpsLoading} className="bg-[#3d5a47] hover:bg-[#2d4437]">
                  {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MapPinned className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">Ubicación activa</p>
                    <p className="text-xs text-green-700">Precisión aprox. {userLocation?.precisionM ?? "—"} m</p>
                    {puntoMasCercano && (
                      <p className="text-xs text-green-700 mt-1">
                        Más cercano: <strong>{puntoMasCercano.nombre}</strong> a {formatDistance(puntoMasCercano.distanciaRealM)}
                      </p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={activarGps} disabled={gpsLoading} className="border-green-300 text-green-700">
                  {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input type="text" placeholder="Buscar puntos de reciclaje..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Filtrar por material</span>
              <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={() => setSelectedFilters([])}><Filter className="w-3 h-3 mr-1" />Limpiar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge key={filter.id} className={`cursor-pointer transition ${selectedFilters.includes(filter.id) ? "bg-[#3d5a47] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} onClick={() => toggleFilter(filter.id)}>
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPoints.map((point, index) => {
            const dentroDelRadio = point.distanciaRealM !== undefined && point.distanciaRealM <= (point.radioValidacionM ?? 50);
            const isSelected = selectedPoint?.id === point.id;
            return (
              <Card
                key={point.id}
                onClick={() => { setSelectedPoint(point); setShowRouteInFallbackMap(false); }}
                className={`border-[#6fae7f]/20 hover:shadow-lg transition cursor-pointer ${isSelected ? "ring-2 ring-[#3d5a47]" : index === 0 && userLocation ? "ring-2 ring-[#6fae7f]/40" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2d4437] mb-1">{point.nombre}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{point.direccion}</p>
                    </div>
                    <Badge className={`${statusColor(point.estado)} text-white border-0`}>{point.estado}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{userLocation ? formatDistance(point.distanciaRealM) : `Radio ${point.radioValidacionM ?? 50} m`}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{point.comuna}</span>
                    {userLocation && (
                      <Badge className={dentroDelRadio ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                        {dentroDelRadio ? "Dentro del radio" : `Radio ${point.radioValidacionM ?? 50} m`}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {point.materiales.map((material) => <Badge key={material} variant="outline" className="text-xs border-[#6fae7f]">{material}</Badge>)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-[#3d5a47] hover:bg-[#2d4437]"
                      disabled={routeLoading && isSelected}
                      onClick={(event) => {
                        event.stopPropagation();
                        mostrarRutaAuto(point);
                      }}
                    >
                      {routeLoading && isSelected ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Route className="w-4 h-4 mr-2" />}
                      Cómo llegar en auto
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#3d5a47] text-[#3d5a47]"
                      onClick={(event) => {
                        event.stopPropagation();
                        abrirEnGoogleMaps(point);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-[#f5f7f5] relative">
        {USE_GOOGLE_JS_MAPS && GOOGLE_MAPS_API_KEY && !mapsError ? (
          <div ref={mapContainerRef} className="absolute inset-0" />
        ) : (
          <iframe
            title="Mapa de reciclaje EcoConce"
            src={iframeMapUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}

        {(selectedPoint || routeInfo || mapsReady) && (
          <div className="absolute left-6 bottom-6 max-w-lg rounded-2xl bg-white/95 backdrop-blur p-5 shadow-xl border border-[#6fae7f]/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6fae7f] font-bold">Google Maps</p>
                <h2 className="text-xl font-bold text-[#2d4437]">{selectedPoint?.nombre ?? "Mapa conectado"}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {routeInfo || (selectedPoint ? "Selecciona “Cómo llegar en auto” para dibujar la ruta desde tu GPS." : "Selecciona un ecopunto para calcular una ruta en auto.")}
                </p>
              </div>
              <Badge className="bg-[#3d5a47] text-white">{filteredPoints.length} puntos visibles</Badge>
            </div>
            {selectedPoint && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" className="bg-[#3d5a47] hover:bg-[#2d4437]" onClick={() => mostrarRutaAuto(selectedPoint)} disabled={routeLoading}>
                  {routeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Route className="w-4 h-4 mr-2" />}
                  Ruta en auto
                </Button>
                <Button size="sm" variant="outline" className="border-[#3d5a47] text-[#3d5a47]" onClick={() => abrirEnGoogleMaps(selectedPoint)}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Abrir Google Maps
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
