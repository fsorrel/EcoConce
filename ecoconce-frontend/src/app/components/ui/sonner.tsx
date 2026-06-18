import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return <Sonner theme="light" richColors className="toaster group" {...props} />;
};

export { Toaster };
