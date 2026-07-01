import { describe, it, expect, beforeEach } from "vitest";
import {
  saveToken,
  getToken,
  clearToken,
  getRolePath,
  saveCurrentUser,
  getCurrentUser,
  clearCurrentUser,
} from "../../app/lib/api";

describe("api.ts — utilidades de sesión", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saveToken / getToken / clearToken funcionan en ciclo completo", () => {
    expect(getToken()).toBeNull();
    saveToken("mi-jwt");
    expect(getToken()).toBe("mi-jwt");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("saveCurrentUser persiste y getCurrentUser recupera", () => {
    const usuario = { id: 5, correo: "u@test.cl", rol: "Ciudadano", rolId: 1 };
    saveCurrentUser(usuario);
    const recuperado = getCurrentUser();
    expect(recuperado?.id).toBe(5);
    expect(recuperado?.correo).toBe("u@test.cl");
  });

  it("getCurrentUser devuelve null si no hay sesión guardada", () => {
    expect(getCurrentUser()).toBeNull();
  });

  it("clearCurrentUser elimina sesión y token", () => {
    saveToken("tok");
    saveCurrentUser({ id: 1, correo: "a@b.cl", rol: "Administrador", rolId: 2 });
    clearCurrentUser();
    expect(getToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });

  // Mapeo real del proyecto: rolId 2 = admin, 3 = mantenedor, 1 = ciudadano.
  describe("getRolePath", () => {
    it("admin (rolId 2 o rol con 'admin') → /admin", () => {
      expect(getRolePath({ rolId: 2, rol: "Administrador", correo: "a@b.cl" })).toBe("/admin");
      expect(getRolePath({ rolId: 0, rol: "ADMIN", correo: "x@b.cl" })).toBe("/admin");
    });

    it("mantenedor (rolId 3 o rol con 'mantenedor') → /mantenedor", () => {
      expect(getRolePath({ rolId: 3, rol: "Mantenedor", correo: "m@b.cl" })).toBe("/mantenedor");
    });

    it("ciudadano (rolId 1) → /ciudadano", () => {
      expect(getRolePath({ rolId: 1, rol: "Ciudadano", correo: "c@b.cl" })).toBe("/ciudadano");
    });

    it("rol desconocido → /ciudadano por defecto", () => {
      expect(getRolePath({ rolId: 99, rol: "OTRO", correo: "x@b.cl" })).toBe("/ciudadano");
    });

    it("admin por correo reservado → /admin", () => {
      expect(getRolePath({ rolId: 0, rol: "", correo: "admin@ecoconce.cl" })).toBe("/admin");
    });
  });
});
