import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Recycle, Map, ClipboardList, BookOpen, Award, TrendingUp } from "lucide-react";
//import heroImage from "figma:asset/6514f1539ef88365b03a66a4f5fa98a12b5a75c7.png";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7f5] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#3d5a47] rounded-full flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-[#3d5a47]">EcoConce</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-gray-700 hover:text-[#3d5a47] transition">Beneficios</a>
            <a href="#funciones" className="text-gray-700 hover:text-[#3d5a47] transition">Funciones</a>
            <a href="#como-funciona" className="text-gray-700 hover:text-[#3d5a47] transition">Cómo Funciona</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[#3d5a47]">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/registro">
              <Button className="bg-[#3d5a47] hover:bg-[#2d4437]">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-[#2d4437] mb-6 leading-tight">
              Recicla con propósito en Concepción
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              EcoConce te ayuda a encontrar puntos de reciclaje cercanos, aprender sobre clasificación de residuos y registrar tus formularios de reciclaje y contribuir al cuidado del medio ambiente.
            </p>
            <div className="flex gap-4">
              <Link to="/registro">
                <Button size="lg" className="bg-[#3d5a47] hover:bg-[#2d4437] text-lg px-8">
                  Comenzar Ahora
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 border-[#3d5a47] text-[#3d5a47] hover:bg-[#3d5a47] hover:text-white">
                Ver Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2d4437] mb-4">
              ¿Por qué elegir EcoConce?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa para facilitar el reciclaje y promover hábitos sustentables
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[#6fae7f]/20 hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-[#6fae7f]/10 rounded-full flex items-center justify-center mb-4">
                  <Map className="w-7 h-7 text-[#3d5a47]" />
                </div>
                <h3 className="text-xl font-bold text-[#2d4437] mb-3">
                  Encuentra Puntos Cercanos
                </h3>
                <p className="text-gray-600">
                  Localiza fácilmente puntos de reciclaje en Concepción con información en tiempo real sobre capacidad y materiales aceptados.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#6fae7f]/20 hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-[#6fae7f]/10 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-[#3d5a47]" />
                </div>
                <h3 className="text-xl font-bold text-[#2d4437] mb-3">
                  Formulario de reciclaje
                </h3>
                <p className="text-gray-600">
                  Informa lo que reciclaste según los materiales aceptados y deja el registro en la base de datos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#6fae7f]/20 hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-[#6fae7f]/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-[#3d5a47]" />
                </div>
                <h3 className="text-xl font-bold text-[#2d4437] mb-3">
                  Gana Recompensas
                </h3>
                <p className="text-gray-600">
                  Acumula puntos, desbloquea medallas y sigue tu progreso mientras contribuyes al cuidado del planeta.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funciones" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2d4437] mb-4">
              Funciones Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para reciclar de manera efectiva
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-[#6fae7f] to-[#3d5a47] rounded-2xl p-8 text-white shadow-xl">
                <Map className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Mapa Interactivo</h3>
                <p className="text-lg opacity-90 mb-6">
                  Visualiza todos los puntos de reciclaje de Concepción con filtros por tipo de material y estado en tiempo real.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Estado: Activo, Congestionado, Colapsado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Horarios y direcciones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Materiales aceptados</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#6fae7f]/20">
                <div className="aspect-video bg-gradient-to-br from-[#f5f7f5] to-[#e8ede9] rounded-lg flex items-center justify-center">
                  <Map className="w-24 h-24 text-[#3d5a47] opacity-30" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#6fae7f]/20">
                <div className="aspect-video bg-gradient-to-br from-[#f5f7f5] to-[#e8ede9] rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-24 h-24 text-[#3d5a47] opacity-30" />
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-br from-[#8ec79f] to-[#6fae7f] rounded-2xl p-8 text-white shadow-xl">
                <ClipboardList className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Registro de formularios</h3>
                <p className="text-lg opacity-90 mb-6">
                  La plataforma guarda cada formulario de reciclaje con usuario, punto, material, cantidad, unidad, estado y puntos obtenidos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Registro conectado al backend</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Detalle de materiales declarados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Revisión y aprobación de formularios</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="bg-[#f5f7f5] py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2d4437] mb-4">
              Aprende a Reciclar Mejor
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Accede a guías educativas sobre reciclaje, compostaje y cuidado ambiental
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-[#6fae7f] to-[#3d5a47] rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-[#2d4437]">Guía de Separación</h4>
                <p className="text-gray-600 text-sm">
                  Aprende a separar correctamente residuos en casa
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-[#8ec79f] to-[#6fae7f] rounded-lg mb-4 flex items-center justify-center">
                  <Recycle className="w-12 h-12 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-[#2d4437]">Compostaje Doméstico</h4>
                <p className="text-gray-600 text-sm">
                  Crea compost en tu hogar con residuos orgánicos
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-[#6fae7f] to-[#4a6b55] rounded-lg mb-4 flex items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-[#2d4437]">Impacto Ambiental</h4>
                <p className="text-gray-600 text-sm">
                  Conoce el impacto positivo del reciclaje
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#3d5a47] to-[#2d4437] py-20">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Comienza tu Viaje Sustentable Hoy
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a la comunidad de recicladores de Concepción y haz la diferencia
          </p>
          <Link to="/registro">
            <Button size="lg" className="bg-white text-[#3d5a47] hover:bg-gray-100 text-lg px-10">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d4437] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#6fae7f] rounded-full flex items-center justify-center">
                  <Recycle className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">EcoConce</span>
              </div>
              <p className="text-sm opacity-80">
                Promoviendo el reciclaje y cuidado ambiental en Concepción, Chile
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Mapa de Reciclaje</a></li>
                <li><a href="#" className="hover:opacity-100">Formularios</a></li>
                <li><a href="#" className="hover:opacity-100">Guías</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Blog</a></li>
                <li><a href="#" className="hover:opacity-100">Ayuda</a></li>
                <li><a href="#" className="hover:opacity-100">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Privacidad</a></li>
                <li><a href="#" className="hover:opacity-100">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm opacity-70">
            <p>&copy; 2026 EcoConce. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
