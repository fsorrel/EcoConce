import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { getCurrentUser, getNormalizedRoleName, getRolePath } from "../../lib/api";

type Rol = "ciudadano" | "admin" | "mantenedor";

interface Props {
  children: ReactNode;
  rol: Rol;
}

/**
 * Capa de UX: evita mostrar la UI de un rol a quien no corresponde.
 * La seguridad real vive en el backend (Spring Security valida el JWT y el rol
 * en cada request); esto solo mejora la experiencia evitando pantallas vacías.
 */
export function ProtectedRoute({ children, rol }: Props) {
  const usuario = getCurrentUser();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (getNormalizedRoleName(usuario) !== rol) {
    // Redirige al panel que sí le corresponde al usuario
    return <Navigate to={getRolePath(usuario)} replace />;
  }

  return <>{children}</>;
}
