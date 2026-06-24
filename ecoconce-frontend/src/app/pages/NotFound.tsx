import { Link, useNavigate } from "react-router";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#f5f7f5] p-6 text-center text-gray-600">
      <span className="text-7xl font-bold text-[#6fae7f]">404</span>
      <p className="text-xl text-[#2d4437]">Página no encontrada</p>
      <p className="text-sm text-gray-500 max-w-md">
        La dirección que ingresaste no existe o fue movida.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-[#3d5a47] px-4 py-2 text-sm font-medium text-[#3d5a47] hover:bg-[#3d5a47]/5"
        >
          Volver
        </button>
        <Link
          to="/"
          className="rounded-md bg-[#3d5a47] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d4437]"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
