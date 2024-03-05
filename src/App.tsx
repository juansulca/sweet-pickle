import { Menu } from "@/components/menu";
import { Canvas } from "./components/canvas";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from "react";

function App() {
  const queryClient = new QueryClient();
  const [page, setPage] = useState('menu');
  const [deviceId, setDeviceId] = useState('');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        {page === 'menu' && <Menu onClickCanvas={() => setPage('canvas')} onClickConfigure={() => setPage('config')}/>}
        {page === 'canvas' && <Canvas />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
