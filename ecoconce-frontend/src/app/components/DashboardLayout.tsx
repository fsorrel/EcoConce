import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Home,
  Map,
  ClipboardList,
  BookOpen,
  User,
  LogOut,
  BarChart3,
  MapPin,
  Users,
  Trophy,
  Gift,
  AlertTriangle,
  FileWarning,
  TicketCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  clearCurrentUser,
  getCurrentUser,
  getNormalizedRoleName,
  getRolePath,
  refreshCurrentUserFromBackend,
} from "../lib/api";
import type { UsuarioSesion } from "../lib/api";
import React, { useEffect, useMemo, useState } from "react";

type Role = "ciudadano" | "admin" | "mantenedor";

type NavItem = {
  icon: typeof Home;
  label: string;
  path: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: Record<Role, NavSection[]> = {
  ciudadano: [
    {
      title: "General",
      items: [
        { icon: Home, label: "Inicio", path: "/ciudadano" },
        { icon: Map, label: "Mapa de Reciclaje", path: "/ciudadano/mapa" },
      ],
    },
    {
      title: "Actividad",
      items: [
        { icon: ClipboardList, label: "Formularios", path: "/ciudadano/formularios" },
        { icon: Trophy, label: "Premios", path: "/ciudadano/premios" },
        { icon: FileWarning, label: "Reportar punto", path: "/ciudadano/reportar" },
      ],
    },
    {
      title: "Información",
      items: [
        { icon: BookOpen, label: "Guías", path: "/ciudadano/guias" },
        { icon: User, label: "Mi Perfil", path: "/ciudadano/perfil" },
      ],
    },
  ],
  admin: [
    {
      title: "General",
      items: [{ icon: BarChart3, label: "Resumen", path: "/admin" }],
    },
    {
      title: "Gestión",
      items: [
        { icon: Users, label: "Usuarios activos", path: "/admin/usuarios" },
        { icon: MapPin, label: "Puntos de Reciclaje", path: "/admin/puntos" },
        { icon: Gift, label: "Premios", path: "/admin/premios" },
        { icon: TicketCheck, label: "Canjes", path: "/admin/canjes" },
      ],
    },
    {
      title: "Seguimiento",
      items: [{ icon: AlertTriangle, label: "Reportes", path: "/admin/reportes" }],
    },
  ],
  mantenedor: [
    {
      title: "General",
      items: [{ icon: Home, label: "Resumen", path: "/mantenedor" }],
    },
    {
      title: "Gestión",
      items: [{ icon: MapPin, label: "Mis puntos", path: "/mantenedor/puntos" }],
    },
    {
      title: "Seguimiento",
      items: [{ icon: AlertTriangle, label: "Reportes", path: "/mantenedor/reportes" }],
    },
  ],
};

const roleLabel = (currentRole: Role, usuario: UsuarioSesion | null) => {
  if (currentRole === "admin") return "Administrador";
  if (currentRole === "mantenedor") return "Mantenedor";
  return `${(usuario?.puntos ?? 0).toLocaleString("es-CL")} Pts`;
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getCurrentUser());

  const currentRole = useMemo<Role>(() => {
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname.startsWith("/mantenedor")) return "mantenedor";
    return "ciudadano";
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    if (!getCurrentUser()) {
      navigate("/login", { replace: true });
      return;
    }

    refreshCurrentUserFromBackend()
      .then((updated) => {
        if (isMounted && updated) setUsuario(updated);
      })
      .catch(() => {
        if (isMounted) setUsuario(getCurrentUser());
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!usuario) return;

    const expectedRole = getNormalizedRoleName(usuario);
    if (currentRole !== expectedRole) {
      navigate(getRolePath(usuario), { replace: true });
    }
  }, [usuario, currentRole, navigate]);

  const sections = navSections[currentRole];

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f5f7f5]">
      <aside className="w-72 bg-[#3d5a47] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#6fae7f] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 18c-3.31-1.01-6-5.17-6-9V7.3l6-3 6 3V11c0 3.83-2.69 7.99-6 9z" />
                <path d="M8 12l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-xl">EcoConce</span>
          </Link>
        </div>

        <nav className="sidebar-scroll flex-1 py-5 overflow-y-auto">
          <div className="space-y-5">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                  {section.title}
                </p>

                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== `/${currentRole}` && location.pathname.startsWith(item.path));

                    return (
                      <li key={`${section.title}-${item.path}-${item.label}`}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                            isActive
                              ? "bg-white/20 border-l-4 border-[#8ec79f]"
                              : "hover:bg-white/10 border-l-4 border-transparent"
                          }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6fae7f] rounded-full flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {usuario?.nombreAlias ?? "Usuario EcoConce"}
              </p>
              <p className="text-sm text-white/70 truncate">
                {roleLabel(currentRole, usuario)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}