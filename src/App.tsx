import { Menu } from "@/components/menu";
import { Canvas } from "./components/canvas";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <Menu />
        <Canvas />
      </div>
    </QueryClientProvider>
  );
}

export default App;
