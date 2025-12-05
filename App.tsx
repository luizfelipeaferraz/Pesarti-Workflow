import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { OrderBoard, ReportsDashboard } from './components/OutputSection';
import { LoginScreen } from './components/LoginScreen';
import { extractOrderData } from './services/gemini';
import { supabase, fetchOrders, createOrder, updateOrder } from './services/supabase';
import { Order, OrderStatus } from './types';
import { Shirt, Plus, CheckCircle2, LayoutDashboard, BarChart3, LogOut, User, WifiOff, Wifi } from 'lucide-react';

const App: React.FC = () => {
  // Estado de Autenticação
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('pesarti_user'));

  // Estados da Aplicação
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'reports'>('board');
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(!!supabase);
  
  // Estado para notificação Toast
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Carregar Pedidos Iniciais (Do Banco ou LocalStorage)
  useEffect(() => {
    const loadOrders = async () => {
      if (supabase) {
        // MODO ONLINE (SUPABASE)
        try {
          const data = await fetchOrders();
          setOrders(data);
          setIsOnline(true);
        } catch (err) {
          console.error("Falha ao carregar do Supabase", err);
          setIsOnline(false); // Fallback visual
        }
      } else {
        // MODO OFFLINE (LOCALSTORAGE)
        const saved = localStorage.getItem('pesarti_orders');
        if (saved) {
          try {
            setOrders(JSON.parse(saved));
          } catch (e) {
            console.error("Erro ao ler localStorage", e);
          }
        }
        setIsOnline(false);
      }
    };
    loadOrders();
  }, []);

  // Configurar Realtime do Supabase (Atualização automática nas outras telas)
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Mudança detectada no banco:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as Order;
          setOrders(prev => [...prev, newOrder]);
          showNotification(`Novo pedido recebido!`);
        } else if (payload.eventType === 'UPDATE') {
          const updatedOrder = payload.new as Order;
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        }
        // DELETE pode ser implementado futuramente
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persistência no LocalStorage (Backup local sempre)
  useEffect(() => {
    localStorage.setItem('pesarti_orders', JSON.stringify(orders));
  }, [orders]);

  // Limpa notificação após 3 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string) => {
    setNotification({ message, type: 'success' });
  };

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    localStorage.setItem('pesarti_user', user); // Lembrar usuário
    showNotification(`Bem-vindo, ${user}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pesarti_user');
  };

  const handleProcessNewOrder = async (rawText: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const data = await extractOrderData(rawText);
      
      const newOrder: Order = {
        id: crypto.randomUUID(),
        data,
        status: 'DESIGN_PENDING',
        createdAt: new Date().toISOString(),
        history: [{
          timestamp: new Date().toISOString(),
          action: 'Pedido Criado',
          details: `Importado por ${currentUser} via IA. Categoria: ${data.category}`
        }]
      };

      // 1. Atualiza Estado Local (Feedback Rápido)
      setOrders(prev => [...prev, newOrder]);
      
      // 2. Salva no Banco (se online)
      if (supabase) {
        await createOrder(newOrder);
      }

      setIsInputOpen(false);
      showNotification(`Pedido #${data.orderId} criado com sucesso na fila de Design.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar pedido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === newStatus) return;

    let message = '';
    let action = '';
    
    if (newStatus === 'APPROVAL_PENDING') {
      message = `Pedido #${order.data.orderId} movido para Aprovação.`;
      action = 'Enviado para Aprovação';
    } else if (newStatus === 'PRODUCTION_PENDING') {
      message = `Pedido #${order.data.orderId} liberado para Produção.`;
      action = 'Início de Produção';
    } else if (newStatus === 'COMPLETED') {
      message = `Pedido #${order.data.orderId} finalizado e arquivado!`;
      action = 'Produção Finalizada';
    } else if (newStatus === 'DESIGN_PENDING') {
      message = `Pedido #${order.data.orderId} retornado para Design.`;
      action = 'Retornado para Design';
    }

    const updatedHistory = [...order.history, {
      timestamp: new Date().toISOString(),
      action: action,
      details: `Status alterado por ${currentUser}`
    }];

    const updates = { 
      status: newStatus,
      history: updatedHistory
    };

    // 1. Atualiza Local
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, ...updates };
      }
      return o;
    }));
    
    // 2. Atualiza Banco
    if (supabase) {
      await updateOrder(orderId, updates);
    }
    
    showNotification(message);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    if (draggedOrderId) {
      handleUpdateStatus(draggedOrderId, status);
      setDraggedOrderId(null);
    }
  };

  // Renderização Condicional: Login ou App
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#eef0f4] text-gray-900 font-sans overflow-hidden relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className="bg-gray-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1 text-white">
              <CheckCircle2 size={16} />
            </div>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Fixo */}
      <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0 z-20 shadow-sm">
        <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-700 p-2 rounded-lg text-white shadow-md">
                <Shirt size={22} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-800 leading-none tracking-tight">Pesarti</h1>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Workflow</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
               <button 
                onClick={() => setActiveTab('board')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'board' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
               >
                 <LayoutDashboard size={16} /> Board
               </button>
               <button 
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'reports' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
               >
                 <BarChart3 size={16} /> Relatórios
               </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`} title={isOnline ? "Conectado ao Banco de Dados" : "Modo Local (Sem sincronização)"}>
               {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
               <span className="hidden sm:inline">{isOnline ? 'Online' : 'Local'}</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100">
              <User size={16} className="text-gray-400" />
              <span className="font-semibold">{currentUser}</span>
            </div>

            <button 
              onClick={() => setIsInputOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span className="hidden md:inline">Novo Pedido</span>
            </button>

            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded shadow-sm flex-shrink-0 flex justify-between items-center">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
          </div>
        )}

        {/* Content Switcher */}
        {activeTab === 'board' ? (
          <OrderBoard 
            orders={orders} 
            onUpdateStatus={handleUpdateStatus} 
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ) : (
          <ReportsDashboard orders={orders} />
        )}
      </main>

      {/* Modal de Input */}
      <InputSection 
        isOpen={isInputOpen} 
        onClose={() => setIsInputOpen(false)}
        onProcess={handleProcessNewOrder}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default App;