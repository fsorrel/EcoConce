//App.tsx
import { RouterProvider } from 'react-router';
//import { router } from './routes';
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}
