import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { api, Guia } from "../lib/api";
import { Search, BookOpen, Clock, User, ClipboardList } from "lucide-react";

export function Guides() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("todos");
  const [guides, setGuides] = useState<Guia[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.guias()
      .then(setGuides)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las guías"));
  }, []);

  const materials = useMemo(() => ["todos", ...Array.from(new Set(guides.map((guide) => guide.material).filter(Boolean)))], [guides]);

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch = `${guide.titulo} ${guide.descripcion} ${guide.contenido}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = selectedMaterial === "todos" || guide.material === selectedMaterial;
    return matchesSearch && matchesMaterial;
  });

  const featured = filteredGuides[0] ?? guides[0];

  return (
    <div className="p-8 space-y-8 bg-[#f5f7f5] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-[#2d4437] mb-2">Guías y Artículos</h1>
        <p className="text-gray-600">Contenido cargado desde la tabla guias_reciclaje del backend</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type="text" placeholder="Buscar guías y artículos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
        </div>
        <div className="flex flex-wrap gap-2">
          {materials.map((material) => (
            <Badge key={material} className={`cursor-pointer transition px-4 py-2 text-sm ${selectedMaterial === material ? "bg-[#3d5a47] text-white hover:bg-[#2d4437]" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`} onClick={() => setSelectedMaterial(material)}>
              {material === "todos" ? "Todos" : material}
            </Badge>
          ))}
        </div>
      </div>

      {featured && (
        <Card className="border-[#6fae7f]/20 bg-gradient-to-r from-[#3d5a47] to-[#6fae7f] text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4"><Badge className="bg-yellow-400 text-yellow-900 border-0">Destacado</Badge></div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">{featured.titulo}</h2>
                <p className="text-lg opacity-90 mb-6">{featured.descripcion}</p>
                <div className="flex items-center gap-6 text-sm mb-6 opacity-90">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" />Lectura rápida</span>
                  <span className="flex items-center gap-2"><User className="w-4 h-4" />EcoConce</span>
                </div>
                <Button size="lg" className="bg-white text-[#3d5a47] hover:bg-gray-100">Leer Guía</Button>
              </div>
              <div className="flex items-center justify-center"><div className="text-9xl">📚</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2d4437]">Guías disponibles</h2>
          <p className="text-sm text-gray-600">{filteredGuides.length} artículos</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="border-[#6fae7f]/20 hover:shadow-lg transition cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-full aspect-video bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-lg mb-4 flex items-center justify-center text-6xl">♻️</div>
                <Badge variant="outline" className="mb-3 border-[#6fae7f] text-[#3d5a47]">{guide.material}</Badge>
                <h3 className="font-bold text-lg text-[#2d4437] mb-2 group-hover:text-[#3d5a47] transition">{guide.titulo}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{guide.descripcion}</p>
                <Button variant="outline" size="sm" className="w-full border-[#3d5a47] text-[#3d5a47] hover:bg-[#3d5a47] hover:text-white group-hover:bg-[#3d5a47] group-hover:text-white transition">
                  <BookOpen className="w-4 h-4 mr-2" /> Leer Artículo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-[#6fae7f]/20 bg-gradient-to-br from-[#f5f7f5] to-white">
        <CardContent className="p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#2d4437] mb-4">¿Ya reciclaste hoy?</h3>
            <p className="text-gray-600 mb-6">Registra lo que llevaste al ecopunto usando la tabla formularios_reciclaje.</p>
            <Button size="lg" className="bg-[#3d5a47] hover:bg-[#2d4437]" onClick={() => { window.location.href = "/ciudadano/formularios"; }}>
              <ClipboardList className="w-4 h-4 mr-2" /> Ir a formularios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
