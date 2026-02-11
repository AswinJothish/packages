import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from "@/components/ui/sonner";

const wsUrl = "ws://localhost:4000/api/admin/ws";

const WebSocketProvider = ({ }: { url: string }) => {


  return (
    <>
      <Toaster className="text-white mt-12" position="top-right" />
      <App /> 
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSocketProvider url={wsUrl} />
  </React.StrictMode>
);
