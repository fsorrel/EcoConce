import React from "react";
import { Shield, Mail, Clock, FileText } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-emerald-700" />
            <h1 className="text-3xl font-bold text-emerald-900">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            EcoConce — Última actualización: junio 2026
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Vigente bajo Ley 21.719 de Protección de Datos Personales (Chile)
          </p>
        </div>

        {/* Tabla de contenidos */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tabla de contenidos
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><a href="#responsable" className="text-emerald-700 hover:underline">1. Responsable del tratamiento</a></li>
            <li><a href="#datos" className="text-emerald-700 hover:underline">2. Datos que recolectamos y para qué</a></li>
            <li><a href="#base-legal" className="text-emerald-700 hover:underline">3. Base legal del tratamiento</a></li>
            <li><a href="#retencion" className="text-emerald-700 hover:underline">4. Retención de datos</a></li>
            <li><a href="#derechos" className="text-emerald-700 hover:underline">5. Tus derechos (ARCO)</a></li>
            <li><a href="#seguridad" className="text-emerald-700 hover:underline">6. Medidas de seguridad</a></li>
            <li><a href="#terceros" className="text-emerald-700 hover:underline">7. Terceros y transferencias</a></li>
          </ul>
        </div>

        {/* Contenido principal */}
        <div className="space-y-8 text-gray-700">
          {/* Sección 1 */}
          <section id="responsable">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              1. Responsable del Tratamiento
            </h2>
            <p className="mb-3">
              <strong>EcoConce</strong> es una plataforma académica desarrollada por:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Jordan Díaz Zavala</li>
              <li>Fernando Sorrel Pinto</li>
            </ul>
            <p className="mb-3">
              En el contexto del Taller Aplicado de Programación (TPY1101), DUOC UC, sede Concepción.
            </p>
            <p>
              <strong>Contacto para privacidad:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">privacidad@ecoconce.cl</span>
            </p>
          </section>

          {/* Sección 2 */}
          <section id="datos">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              2. Datos que Recolectamos y Para Qué
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-semibold text-emerald-800">RUT</h3>
                <p className="text-sm text-gray-600">
                  Identificación única en el sistema. Evita cuentas duplicadas. Se almacena con protección de uniqueness en la base de datos.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-semibold text-emerald-800">Correo electrónico</h3>
                <p className="text-sm text-gray-600">
                  Autenticación en el sistema (login) y comunicaciones importantes.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-semibold text-emerald-800">Fecha de nacimiento</h3>
                <p className="text-sm text-gray-600">
                  Estadísticas demográficas anonimizadas de participación por rango etario. Campo opcional.
                </p>
              </div>

              <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50">
                <h3 className="font-semibold text-red-800">Sexo/Género ⚠️ Dato Sensible</h3>
                <p className="text-sm text-gray-600">
                  <strong>Dato de categoría especial</strong> bajo la Ley 21.719. Requiere tu consentimiento <strong>explícito y separado</strong>. 
                  Este campo es completamente opcional. Si lo completas, debes autorizar su tratamiento en un checkbox independiente. 
                  Se usa solo para estadísticas demográficas anonimizadas — nunca se expone a nivel individual.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-semibold text-emerald-800">Teléfono y Dirección</h3>
                <p className="text-sm text-gray-600">
                  Contacto y entrega de premios. Campos opcionales. La dirección se usa solo para envíos a domicilio si canjeas un premio con esa modalidad.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-semibold text-emerald-800">Historial de reciclaje</h3>
                <p className="text-sm text-gray-600">
                  Cálculo de puntos, medallas y reportes de impacto ambiental. Es el núcleo del servicio.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-semibold text-emerald-800">Historial de canjes</h3>
                <p className="text-sm text-gray-600">
                  Auditoría y prevención de fraude. Se retiene por 3 años conforme a obligaciones legales.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 3 */}
          <section id="base-legal">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              3. Base Legal del Tratamiento
            </h2>
            <p className="mb-3">
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Consentimiento libre e informado</strong> (Art. 12 Ley 21.719) — otorgado al momento del registro.
              </li>
              <li>
                <strong>Ejecución de contrato</strong> (prestación del servicio de reciclaje y canjes).
              </li>
              <li>
                <strong>Interés legítimo</strong> (seguridad, auditoría, prevención de fraude).
              </li>
              <li>
                <strong>Obligación legal</strong> (retención de datos para auditoría por 3 años).
              </li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section id="retencion">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              4. Retención de Datos
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2 text-sm">
              <p>
                <strong>Datos de tu cuenta (RUT, correo, perfil):</strong> Mientras tu cuenta esté activa, más 1 año después de que la desactives.
              </p>
              <p>
                <strong>Historial de reciclaje:</strong> Indefinido mientras la cuenta esté activa; 2 años después de desactivación.
              </p>
              <p>
                <strong>Historial de canjes:</strong> 3 años (por obligación legal de auditoría).
              </p>
              <p>
                <strong>Metadatos de acceso:</strong> 1 año después del último acceso.
              </p>
              <p className="text-gray-600 italic">
                Puedes solicitar la eliminación anticipada de tus datos ejerciendo tu derecho de cancelación. Responderemos en máximo 15 días hábiles.
              </p>
            </div>
          </section>

          {/* Sección 5 */}
          <section id="derechos">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              5. Tus Derechos (ARCO)
            </h2>
            <p className="mb-4">
              Conforme a la Ley 21.719, tienes derecho a:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">Acceso (A)</h3>
                <p className="text-sm">
                  Conocer qué datos tenemos sobre ti y para qué se usan.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">Rectificación (R)</h3>
                <p className="text-sm">
                  Corregir datos incorrectos o incompletos en tu perfil.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">Cancelación (C)</h3>
                <p className="text-sm">
                  Solicitar la eliminación/anonimización de tus datos. Respecto a datos obligatorios por ley, se anonimizarán.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">Oposición (O)</h3>
                <p className="text-sm">
                  Optar por no recibir comunicaciones comerciales o marketing.
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
              <p className="text-sm">
                <strong>¿Cómo ejercer tus derechos?</strong> Escribe a{" "}
                <span className="font-mono bg-white px-2 py-1 rounded">privacidad@ecoconce.cl</span>{" "}
                con asunto <strong>"Derechos ARCO"</strong> indicando cuál(es) derecho(s) quieres ejercer. 
                Responderemos en un plazo máximo de <strong>15 días hábiles</strong>.
              </p>
            </div>
          </section>

          {/* Sección 6 */}
          <section id="seguridad">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              6. Medidas de Seguridad
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Contraseñas:</strong> Se almacenan con hash BCrypt — nunca se guardan en texto plano.
              </li>
              <li>
                <strong>Comunicaciones:</strong> En producción, todas las conexiones usan HTTPS (cifrado TLS).
              </li>
              <li>
                <strong>Autenticación:</strong> JWT (JSON Web Tokens) con firma criptográfica. Tokens corta vida.
              </li>
              <li>
                <strong>Almacenamiento:</strong> Servidores locales en Chile. Tus datos NO se transfieren al extranjero.
              </li>
              <li>
                <strong>Integridad referencial:</strong> Oracle mantiene constraints de integridad para evitar datos huérfanos.
              </li>
              <li>
                <strong>Auditoría:</strong> Se registran todos los cambios críticos con timestamp y usuario responsable.
              </li>
            </ul>
          </section>

          {/* Sección 7 */}
          <section id="terceros">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              7. Terceros y Transferencias
            </h2>
            <p className="mb-3">
              <strong>EcoConce NO comparte tus datos personales con terceros.</strong>
            </p>
            <p className="mb-3">
              El único servicio externo que recibe datos es:
            </p>
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-3">
              <h3 className="font-semibold text-blue-800 mb-2">Google Maps</h3>
              <p className="text-sm">
                Embed del mapa de puntos de reciclaje. Solo recibe <strong>coordenadas de puntos públicos de reciclaje</strong> — nunca información personal de usuarios. Operamos sin API key identificable, por lo que Google no vincula estos datos a una cuenta específica.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Los datos se almacenan en servidores locales en Chile bajo nuestra exclusiva responsabilidad. 
              Si en futuro se activa Google Maps JavaScript API con credenciales, evaluaremos el cumplimiento de estándares 
              internacionales de transferencia bajo la Ley 21.719.
            </p>
          </section>

          {/* Footer */}
          <section className="border-t-2 border-gray-200 pt-8 mt-12">
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-6">
              <p className="text-sm text-gray-700 mb-4">
                <strong>¿Tienes preguntas sobre esta política?</strong>
              </p>
              <p className="text-sm flex items-center gap-2 text-emerald-800 font-medium">
                <Mail className="w-5 h-5" />
                privacidad@ecoconce.cl
              </p>
              <p className="text-xs text-gray-600 mt-4">
                Esta política rige bajo la Ley 21.719 de Protección de Datos Personales, vigente desde diciembre 2026 en Chile.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
