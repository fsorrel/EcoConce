import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Captura errores de render no controlados en cualquier página y muestra una
 * pantalla de recuperación en lugar de dejar la app en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("EcoConce ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#f5f7f5] p-6 text-center">
          <h2 className="text-xl font-semibold text-[#2d4437]">Algo salió mal</h2>
          <p className="text-sm text-gray-600 max-w-md">
            Ocurrió un error inesperado al mostrar esta página. Puedes volver al inicio e intentar de nuevo.
          </p>
          <button
            className="rounded-md bg-[#3d5a47] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d4437]"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
