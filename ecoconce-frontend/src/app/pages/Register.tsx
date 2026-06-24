import React, { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Loader2, Recycle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { api, saveCurrentUser } from "../lib/api";
import type { ComunaRow, RegionRow } from "../lib/api";

type RegistroForm = {
  nombreAlias: string;
  rut: string;
  fechaNacimiento: string;
  sexoGenero: string;
  correo: string;
  contrasena: string;
  confirmPassword: string;
  telefono: string;
  regionId: number;
  comunaId: number;
  direccion: string;
  aceptaTerminos: boolean;
};

type CampoRegistro = keyof RegistroForm;
type ErroresRegistro = Partial<Record<CampoRegistro, string>>;
type CamposTocados = Partial<Record<CampoRegistro, boolean>>;

const initialForm: RegistroForm = {
  nombreAlias: "",
  rut: "",
  fechaNacimiento: "",
  sexoGenero: "",
  correo: "",
  contrasena: "",
  confirmPassword: "",
  telefono: "",
  regionId: 0,
  comunaId: 0,
  direccion: "",
  aceptaTerminos: false,
};

const limpiarRut = (rut: string) => rut.replace(/[.\-\s]/g, "").toUpperCase();

const formatearRut = (rut: string) => {
  const limpio = limpiarRut(rut).replace(/[^0-9K]/g, "");

  if (limpio.length <= 1) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let cuerpoFormateado = "";
  let contador = 0;

  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    contador += 1;

    if (contador === 3 && i !== 0) {
      cuerpoFormateado = `.${cuerpoFormateado}`;
      contador = 0;
    }
  }

  return `${cuerpoFormateado}-${dv}`;
};

const validarRut = (rut: string) => {
  const limpio = limpiarRut(rut);

  if (!/^[0-9]{7,8}[0-9K]$/.test(limpio)) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const resultado = 11 - resto;
  const dvCalculado = resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado);

  return dv === dvCalculado;
};

const validarCorreo = (correo: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
};

const calcularEdad = (fecha: string) => {
  const nacimiento = new Date(fecha);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad;
};

const validarTelefono = (telefono: string) => {
  if (!telefono.trim()) return true;
  return /^\+?[0-9\s-]{8,15}$/.test(telefono.trim());
};

const validarCampo = (campo: CampoRegistro, data: RegistroForm): string | undefined => {
  const nombreAlias = data.nombreAlias.trim();
  const correo = data.correo.trim();
  const telefono = data.telefono.trim();
  const direccion = data.direccion.trim();

  if (campo === "nombreAlias") {
    if (!nombreAlias) return "El nombre o alias es obligatorio.";
    if (nombreAlias.length < 3) return "Debe tener al menos 3 caracteres.";
    if (nombreAlias.length > 60) return "No puede superar los 60 caracteres.";
    if (!/^[a-zA-ZÀ-ÿÑñ0-9 ._-]+$/.test(nombreAlias)) {
      return "Usa solo letras, números, espacios, puntos, guiones o guion bajo.";
    }
  }

  if (campo === "rut") {
    if (!data.rut.trim()) return "El RUT es obligatorio.";
    if (!validarRut(data.rut)) return "Ingresa un RUT chileno válido.";
  }

  if (campo === "fechaNacimiento") {
    if (!data.fechaNacimiento) return "La fecha de nacimiento es obligatoria.";

    const fecha = new Date(data.fechaNacimiento);
    const hoy = new Date();
    const edad = calcularEdad(data.fechaNacimiento);

    if (Number.isNaN(fecha.getTime())) return "Ingresa una fecha válida.";
    if (fecha > hoy) return "La fecha no puede ser futura.";
    if (edad < 0 || edad > 120) return "Ingresa una fecha de nacimiento real.";
  }

  if (campo === "correo") {
    if (!correo) return "El correo es obligatorio.";
    if (!validarCorreo(correo)) return "Ingresa un correo válido. Ej: usuario@correo.cl";
  }

  if (campo === "telefono") {
    if (!validarTelefono(telefono)) return "Ingresa un teléfono válido. Ej: +56912345678.";
  }

  if (campo === "regionId") {
    if (!data.regionId || Number(data.regionId) <= 0) return "Debes seleccionar una región.";
  }

  if (campo === "comunaId") {
    if (!data.comunaId || Number(data.comunaId) <= 0) return "Debes seleccionar una comuna.";
  }

  if (campo === "direccion") {
    if (direccion && direccion.length < 5) return "La dirección debe tener al menos 5 caracteres.";
    if (direccion.length > 120) return "La dirección no puede superar los 120 caracteres.";
  }

  if (campo === "contrasena") {
    if (!data.contrasena) return "La contraseña es obligatoria.";
    if (data.contrasena.length < 8) return "Debe tener al menos 8 caracteres.";
    if (!/[A-ZÁÉÍÓÚÑ]/.test(data.contrasena)) return "Debe incluir al menos una mayúscula.";
    if (!/[a-záéíóúñ]/.test(data.contrasena)) return "Debe incluir al menos una minúscula.";
    if (!/[0-9]/.test(data.contrasena)) return "Debe incluir al menos un número.";
  }

  if (campo === "confirmPassword") {
    if (!data.confirmPassword) return "Debes confirmar la contraseña.";
    if (data.contrasena !== data.confirmPassword) return "Las contraseñas no coinciden.";
  }

  if (campo === "aceptaTerminos") {
    if (!data.aceptaTerminos) return "Debes aceptar los términos y condiciones.";
  }

  return undefined;
};

const validarFormulario = (data: RegistroForm) => {
  const campos: CampoRegistro[] = [
    "nombreAlias",
    "rut",
    "fechaNacimiento",
    "correo",
    "telefono",
    "regionId",
    "comunaId",
    "direccion",
    "contrasena",
    "confirmPassword",
    "aceptaTerminos",
  ];

  return campos.reduce<ErroresRegistro>((errores, campo) => {
    const error = validarCampo(campo, data);

    if (error) {
      errores[campo] = error;
    }

    return errores;
  }, {});
};

const ErrorCampo = ({ mensaje }: { mensaje?: string }) => {
  if (!mensaje) return null;

  return (
    <p className="flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="w-3.5 h-3.5" />
      {mensaje}
    </p>
  );
};

const AyudaCampo = ({ children }: { children: ReactNode }) => {
  return <p className="text-xs text-gray-500">{children}</p>;
};

export function Register() {
  const navigate = useNavigate();
  const [regiones, setRegiones] = useState<RegionRow[]>([]);
  const [comunas, setComunas] = useState<ComunaRow[]>([]);
  const [error, setError] = useState("");
  const [loadingComunas, setLoadingComunas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<CamposTocados>({});
  const [formData, setFormData] = useState<RegistroForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<ErroresRegistro>({});

  useEffect(() => {
    Promise.all([api.regiones(), api.comunas()])
      .then(([regionesData, comunasData]) => {
        setRegiones(regionesData);
        setComunas(comunasData);

        const primeraRegion = regionesData[0];
        const primeraComuna = primeraRegion
          ? comunasData.find((comuna) => Number(comuna.region_id) === Number(primeraRegion.id))
          : null;

        setFormData((prev) => ({
          ...prev,
          regionId: primeraRegion ? Number(primeraRegion.id) : 0,
          comunaId: primeraComuna ? Number(primeraComuna.id) : 0,
        }));
      })
      .catch(() => {
        setRegiones([]);
        setComunas([]);
      })
      .finally(() => setLoadingComunas(false));
  }, []);

  const comunasFiltradas = useMemo(() => {
    if (!formData.regionId) return [];
    return comunas.filter((comuna) => Number(comuna.region_id) === Number(formData.regionId));
  }, [comunas, formData.regionId]);

  const passwordChecks = useMemo(() => {
    return [
      {
        label: "Mínimo 8 caracteres",
        valid: formData.contrasena.length >= 8,
      },
      {
        label: "Una mayúscula",
        valid: /[A-ZÁÉÍÓÚÑ]/.test(formData.contrasena),
      },
      {
        label: "Una minúscula",
        valid: /[a-záéíóúñ]/.test(formData.contrasena),
      },
      {
        label: "Un número",
        valid: /[0-9]/.test(formData.contrasena),
      },
    ];
  }, [formData.contrasena]);

  const actualizarCampo = <K extends CampoRegistro>(campo: K, valor: RegistroForm[K]) => {
    const nextData = {
      ...formData,
      [campo]: valor,
    };

    setFormData(nextData);
    setFieldErrors(validarFormulario(nextData));
  };

  const cambiarRegion = (regionId: number) => {
    const primeraComuna = comunas.find((comuna) => Number(comuna.region_id) === regionId);

    const nextData = {
      ...formData,
      regionId,
      comunaId: primeraComuna ? Number(primeraComuna.id) : 0,
    };

    setFormData(nextData);
    setFieldErrors(validarFormulario(nextData));
  };

  const marcarTocado = (campo: CampoRegistro) => {
    setTouched((actual) => ({
      ...actual,
      [campo]: true,
    }));

    setFieldErrors(validarFormulario(formData));
  };

  const debeMostrarError = (campo: CampoRegistro) => {
    return Boolean(fieldErrors[campo] && (touched[campo] || submitted));
  };

  const inputClass = (campo: CampoRegistro) => {
    return debeMostrarError(campo)
      ? "border-red-400 bg-red-50 focus-visible:ring-red-500"
      : "border-gray-300";
  };

  const selectClass = (campo: CampoRegistro) => {
    return `flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 ${
      debeMostrarError(campo)
        ? "border-red-400 bg-red-50 focus-visible:ring-red-500"
        : "border-gray-300 focus-visible:ring-[#6fae7f]"
    }`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    const errores = validarFormulario(formData);
    setFieldErrors(errores);

    if (Object.keys(errores).length > 0) {
      setTouched({
        nombreAlias: true,
        rut: true,
        fechaNacimiento: true,
        correo: true,
        telefono: true,
        regionId: true,
        comunaId: true,
        direccion: true,
        contrasena: true,
        confirmPassword: true,
        aceptaTerminos: true,
      });
      setError("Revisa los campos marcados en rojo antes de crear la cuenta.");
      return;
    }

    setLoading(true);

    try {
      const correoNormalizado = formData.correo.trim().toLowerCase();

      const creado = await api.registrarUsuario({
        rut: formatearRut(formData.rut),
        nombreAlias: formData.nombreAlias.trim(),
        correo: correoNormalizado,
        contrasena: formData.contrasena,
        sexoGenero: formData.sexoGenero,
        fechaNacimiento: formData.fechaNacimiento,
        telefono: formData.telefono.trim(),
        comunaId: Number(formData.comunaId),
        direccion: formData.direccion.trim(),
        rolId: 1,
      });

      // El backend ya devuelve el usuario creado (con su id); combinamos esos datos
      // con los del formulario, sin necesidad de descargar la lista de usuarios.
      saveCurrentUser({
        id: creado.id,
        rut: formatearRut(formData.rut),
        nombreAlias: formData.nombreAlias.trim(),
        correo: correoNormalizado,
        sexoGenero: formData.sexoGenero,
        fechaNacimiento: formData.fechaNacimiento,
        telefono: formData.telefono.trim(),
        comunaId: Number(formData.comunaId),
        direccion: formData.direccion.trim(),
        puntos: creado.puntos ?? 0,
        rolId: 1,
        rol: creado.rol ?? "Ciudadano",
        activo: "S",
      });

      navigate("/ciudadano");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7f5] to-[#e8ede9] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#3d5a47] rounded-full flex items-center justify-center">
              <Recycle className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#3d5a47]">EcoConce</span>
          </Link>

          <p className="text-gray-600">Únete a la comunidad</p>
        </div>

        <Card className="border-[#6fae7f]/20 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-[#2d4437]">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-center">
              Completa tus datos. Los campos obligatorios están marcados con *.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreAlias">Nombre o Alias *</Label>
                  <Input
                    id="nombreAlias"
                    value={formData.nombreAlias}
                    onBlur={() => marcarTocado("nombreAlias")}
                    onChange={(e) => actualizarCampo("nombreAlias", e.target.value)}
                    className={inputClass("nombreAlias")}
                    placeholder="Ej: Fernando"
                  />
                  <ErrorCampo mensaje={debeMostrarError("nombreAlias") ? fieldErrors.nombreAlias : undefined} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    placeholder="12.345.678-9"
                    value={formData.rut}
                    onBlur={() => marcarTocado("rut")}
                    onChange={(e) => actualizarCampo("rut", formatearRut(e.target.value))}
                    className={inputClass("rut")}
                  />
                  <ErrorCampo mensaje={debeMostrarError("rut") ? fieldErrors.rut : undefined} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onBlur={() => marcarTocado("fechaNacimiento")}
                    onChange={(e) => actualizarCampo("fechaNacimiento", e.target.value)}
                    className={inputClass("fechaNacimiento")}
                  />
                  <ErrorCampo
                    mensaje={debeMostrarError("fechaNacimiento") ? fieldErrors.fechaNacimiento : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sexoGenero">Sexo / Género</Label>
                  <select
                    id="sexoGenero"
                    value={formData.sexoGenero}
                    onChange={(e) => actualizarCampo("sexoGenero", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico *</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onBlur={() => marcarTocado("correo")}
                    onChange={(e) => actualizarCampo("correo", e.target.value)}
                    className={inputClass("correo")}
                    placeholder="usuario@correo.cl"
                  />
                  <ErrorCampo mensaje={debeMostrarError("correo") ? fieldErrors.correo : undefined} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onBlur={() => marcarTocado("telefono")}
                    onChange={(e) => actualizarCampo("telefono", e.target.value)}
                    className={inputClass("telefono")}
                    placeholder="+56912345678"
                  />
                  <ErrorCampo mensaje={debeMostrarError("telefono") ? fieldErrors.telefono : undefined} />
                  {!debeMostrarError("telefono") && (
                    <AyudaCampo>Opcional. Puedes usar formato +56 o solo números.</AyudaCampo>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regionId">Región *</Label>
                  <select
                    id="regionId"
                    value={formData.regionId}
                    onBlur={() => marcarTocado("regionId")}
                    onChange={(e) => cambiarRegion(Number(e.target.value))}
                    className={selectClass("regionId")}
                    disabled={loadingComunas}
                  >
                    <option value={0}>Selecciona una región</option>
                    {regiones.map((region) => (
                      <option key={Number(region.id)} value={Number(region.id)}>
                        {region.nombre}
                      </option>
                    ))}
                  </select>
                  <ErrorCampo mensaje={debeMostrarError("regionId") ? fieldErrors.regionId : undefined} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comunaId">Comuna *</Label>
                  <select
                    id="comunaId"
                    value={formData.comunaId}
                    onBlur={() => marcarTocado("comunaId")}
                    onChange={(e) => actualizarCampo("comunaId", Number(e.target.value))}
                    className={selectClass("comunaId")}
                    disabled={loadingComunas || !formData.regionId}
                  >
                    <option value={0}>Selecciona una comuna</option>
                    {comunasFiltradas.map((comuna) => (
                      <option key={Number(comuna.id)} value={Number(comuna.id)}>
                        {comuna.nombre}
                      </option>
                    ))}
                  </select>
                  <ErrorCampo mensaje={debeMostrarError("comunaId") ? fieldErrors.comunaId : undefined} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onBlur={() => marcarTocado("direccion")}
                  onChange={(e) => actualizarCampo("direccion", e.target.value)}
                  className={inputClass("direccion")}
                  placeholder="Ej: Av. Los Carrera 123"
                />
                <ErrorCampo mensaje={debeMostrarError("direccion") ? fieldErrors.direccion : undefined} />
                {!debeMostrarError("direccion") && <AyudaCampo>Opcional.</AyudaCampo>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contrasena">Contraseña *</Label>
                  <Input
                    id="contrasena"
                    type="password"
                    value={formData.contrasena}
                    onBlur={() => marcarTocado("contrasena")}
                    onChange={(e) => actualizarCampo("contrasena", e.target.value)}
                    className={inputClass("contrasena")}
                  />

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className={`flex items-center gap-1 ${
                          check.valid ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {check.valid ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {check.label}
                      </div>
                    ))}
                  </div>

                  <ErrorCampo mensaje={debeMostrarError("contrasena") ? fieldErrors.contrasena : undefined} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onBlur={() => marcarTocado("confirmPassword")}
                    onChange={(e) => actualizarCampo("confirmPassword", e.target.value)}
                    className={inputClass("confirmPassword")}
                  />
                  <ErrorCampo
                    mensaje={debeMostrarError("confirmPassword") ? fieldErrors.confirmPassword : undefined}
                  />
                </div>
              </div>

              <div
                className={`rounded-lg border p-3 ${
                  debeMostrarError("aceptaTerminos")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aceptaTerminos}
                    onBlur={() => marcarTocado("aceptaTerminos")}
                    onChange={(e) => actualizarCampo("aceptaTerminos", e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los términos y condiciones de EcoConce *
                  </span>
                </label>

                <ErrorCampo
                  mensaje={debeMostrarError("aceptaTerminos") ? fieldErrors.aceptaTerminos : undefined}
                />
              </div>

              <Button
                disabled={loading}
                type="submit"
                className="w-full bg-[#3d5a47] hover:bg-[#2d4437]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿Ya tienes una cuenta? </span>
              <Link to="/login" className="text-[#3d5a47] hover:underline font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}