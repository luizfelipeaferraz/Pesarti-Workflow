import React, { useState } from 'react';
import { 
  Palette, 
  Scissors, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  MapPin,
  Dog,
  Camera,
  Type as TypeIcon,
  Heart,
  Shapes,
  History,
  X,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus, OrderCategory } from '../types';

interface CardProps {
  order: Order;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onViewHistory: () => void;
}

interface WCardProps extends CardProps {
  onAdvance: () => void;
}

interface ApprovalCardProps extends CardProps {
  onApprove: () => void;
}

interface RoneyCardProps extends CardProps {
  onFinish: () => void;
}

interface CardBaseProps extends CardProps {
  accentColor: string;
  children: React.ReactNode;
}

interface BoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
  onDrop: (e: React.DragEvent, status: OrderStatus) => void;
}

export const OrderBoard: React.FC<BoardProps> = ({ orders, onUpdateStatus, onDragStart, onDrop }) => {
  const designQueue = orders.filter(o => o.status === 'DESIGN_PENDING').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const approvalQueue = orders.filter(o => o.status === 'APPROVAL_PENDING').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const productionQueue = orders.filter(o => o.status === 'PRODUCTION_PENDING').sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const [historyOrder, setHistoryOrder] = useState<Order | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex h-full min-w-[1024px] gap-6 p-1">
          
          {/* COLUNA 1: W (DESIGN) */}
          <Column 
            title="1. Design (W)" 
            subtitle="Criar Arte & Arquivo"
            icon={<Palette size={24} />}
            headerColor="bg-blue-600 text-white"
            bgColor="bg-gray-100"
            count={designQueue.length}
            onDrop={(e) => onDrop(e, 'DESIGN_PENDING')}
            onDragOver={handleDragOver}
          >
            {designQueue.map(order => (
              <WCard 
                key={order.id} 
                order={order} 
                onAdvance={() => onUpdateStatus(order.id, 'APPROVAL_PENDING')} 
                onDragStart={onDragStart}
                onViewHistory={() => setHistoryOrder(order)}
              />
            ))}
            {designQueue.length === 0 && <EmptyState text="Sem pedidos novos" />}
          </Column>

          {/* COLUNA 2: APROVAÇÃO */}
          <Column 
            title="2. Aprovação" 
            subtitle="Aguardando Cliente"
            icon={<MessageSquare size={24} />}
            headerColor="bg-amber-500 text-white"
            bgColor="bg-gray-100"
            count={approvalQueue.length}
            onDrop={(e) => onDrop(e, 'APPROVAL_PENDING')}
            onDragOver={handleDragOver}
          >
            {approvalQueue.map(order => (
              <ApprovalCard 
                key={order.id} 
                order={order} 
                onApprove={() => onUpdateStatus(order.id, 'PRODUCTION_PENDING')} 
                onDragStart={onDragStart}
                onViewHistory={() => setHistoryOrder(order)}
              />
            ))}
            {approvalQueue.length === 0 && <EmptyState text="Nenhuma aprovação pendente" />}
          </Column>

          {/* COLUNA 3: RONEY (PRODUÇÃO) */}
          <Column 
            title="3. Produção (Roney)" 
            subtitle="Bordar & Finalizar"
            icon={<Scissors size={24} />}
            headerColor="bg-emerald-600 text-white"
            bgColor="bg-gray-100"
            count={productionQueue.length}
            onDrop={(e) => onDrop(e, 'PRODUCTION_PENDING')}
            onDragOver={handleDragOver}
          >
            {productionQueue.map(order => (
              <RoneyCard 
                key={order.id} 
                order={order} 
                onFinish={() => onUpdateStatus(order.id, 'COMPLETED')} 
                onDragStart={onDragStart}
                onViewHistory={() => setHistoryOrder(order)}
              />
            ))}
            {productionQueue.length === 0 && <EmptyState text="Produção em dia!" />}
          </Column>

        </div>
      </div>

      {/* Modal de Histórico */}
      {historyOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <History size={18} /> Histórico do Pedido #{historyOrder.data.orderId}
              </h3>
              <button onClick={() => setHistoryOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                 {historyOrder.history.map((entry, idx) => (
                   <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 group-hover:bg-indigo-500 transition-colors shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1rem)] p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900 text-sm">{entry.action}</div>
                          <time className="font-mono text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString('pt-BR')}</time>
                        </div>
                        {entry.details && <div className="text-slate-500 text-xs">{entry.details}</div>}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ReportsDashboard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  // Helper to calc diff in hours
  const calcDiffHours = (d1: string, d2: string) => {
    return (new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 60 * 60);
  };

  // Metrics Calculation
  let totalDesignTime = 0;
  let designCount = 0;
  let totalApprovalTime = 0;
  let approvalCount = 0;
  
  // Categorias
  const categoryCount: Record<string, number> = {};

  orders.forEach(order => {
    // Categories
    categoryCount[order.data.category] = (categoryCount[order.data.category] || 0) + 1;

    // Times (Simple approx based on history)
    const created = order.history.find(h => h.action.includes('Criado'));
    const designDone = order.history.find(h => h.action.includes('Aprovação'));
    const prodStart = order.history.find(h => h.action.includes('Produção'));

    if (created && designDone) {
      totalDesignTime += calcDiffHours(created.timestamp, designDone.timestamp);
      designCount++;
    }
    if (designDone && prodStart) {
      totalApprovalTime += calcDiffHours(designDone.timestamp, prodStart.timestamp);
      approvalCount++;
    }
  });

  const avgDesign = designCount ? (totalDesignTime / designCount).toFixed(1) : '0';
  const avgApproval = approvalCount ? (totalApprovalTime / approvalCount).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <BarChart3 className="text-indigo-600" /> Relatório de Produção
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-bold uppercase mb-1">Total Pedidos</div>
          <div className="text-3xl font-black text-gray-900">{orders.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-blue-600 text-sm font-bold uppercase mb-1">Tempo Médio Design</div>
          <div className="text-3xl font-black text-gray-900">{avgDesign}h</div>
          <div className="text-xs text-gray-400">Do pedido até upload do arquivo</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-amber-600 text-sm font-bold uppercase mb-1">Tempo Médio Aprovação</div>
          <div className="text-3xl font-black text-gray-900">{avgApproval}h</div>
          <div className="text-xs text-gray-400">Espera pelo cliente</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
           <Shapes size={18} /> Pedidos por Categoria
        </h3>
        <div className="space-y-3">
          {Object.entries(categoryCount).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-3">
               <div className="w-48 text-sm font-medium text-gray-600 truncate">{cat}</div>
               <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                 <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${(count / orders.length) * 100}%` }}
                 ></div>
               </div>
               <div className="w-12 text-right font-bold text-gray-800">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Componentes de Layout ---

const CategoryIcon = ({ category }: { category: OrderCategory }) => {
  switch (category) {
    case 'Pet Ilustração': return <Dog size={16} className="text-indigo-600" />;
    case 'Fotografia': return <Camera size={16} className="text-purple-600" />;
    case 'Iniciais, Datas e Frases': return <TypeIcon size={16} className="text-blue-600" />;
    case 'Eternize': return <Heart size={16} className="text-rose-600" />;
    case 'Elementos': return <Shapes size={16} className="text-orange-600" />;
    default: return <Palette size={16} className="text-gray-600" />;
  }
};

const Column: React.FC<{ 
  title: string, 
  subtitle: string, 
  icon: React.ReactNode, 
  children: React.ReactNode, 
  headerColor: string, 
  bgColor: string, 
  count: number,
  onDrop: (e: React.DragEvent) => void,
  onDragOver: (e: React.DragEvent) => void
}> = ({ title, subtitle, icon, children, headerColor, bgColor, count, onDrop, onDragOver }) => (
  <div 
    className={`flex-1 flex flex-col rounded-xl overflow-hidden shadow-lg border border-gray-200 h-full max-h-full bg-white transition-colors`}
    onDrop={onDrop}
    onDragOver={onDragOver}
  >
    <div className={`p-4 ${headerColor} flex items-center justify-between shadow-md z-10`}>
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg leading-none">{title}</h3>
          <span className="text-xs opacity-90 font-medium">{subtitle}</span>
        </div>
      </div>
      <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
        {count}
      </span>
    </div>
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${bgColor}`}>
      {children}
    </div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white/50 m-2">
    <Clock size={32} className="mb-3 opacity-30" />
    <span className="font-medium text-gray-500">{text}</span>
  </div>
);

const CardBase: React.FC<CardBaseProps> = ({ order, children, accentColor, onDragStart, onViewHistory }) => {
  const timeAgo = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div 
      draggable="true"
      onDragStart={(e) => onDragStart(e, order.id)}
      className={`bg-white rounded-xl shadow-sm border-l-4 ${accentColor} border-y border-r border-gray-200 p-0 overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group cursor-grab active:cursor-grabbing`}
    >
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex justify-between items-center">
        <span className="font-mono text-sm font-bold text-gray-600">
          #{order.data.orderId}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Clock size={12} /> {timeAgo}
          </span>
          <button onClick={onViewHistory} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Ver Histórico">
            <History size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

// --- CARTÃO W (DESIGNER) ---
const WCard: React.FC<WCardProps> = ({ order, onAdvance, onDragStart, onViewHistory }) => (
  <CardBase order={order} accentColor="border-blue-500" onDragStart={onDragStart} onViewHistory={onViewHistory}>
    {/* Seção Principal: Imagem e Specs */}
    <div className="flex gap-4">
      {/* Imagem Grande */}
      <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 relative group flex-shrink-0">
         <img 
            src={order.data.imageLink} 
            alt="Ref" 
            className="w-full h-full object-cover rounded-lg" 
            onError={(e) => (e.currentTarget.style.display = 'none')} 
         />
         <a 
            href={order.data.imageLink} 
            target="_blank" 
            className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white z-20 transition-all rounded-lg" 
            rel="noreferrer"
            title="Abrir imagem original"
         >
            <ExternalLink size={24} />
         </a>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit uppercase tracking-wide">
          <CategoryIcon category={order.data.category} />
          {order.data.category}
        </div>
        <div className="text-lg font-bold text-gray-900 leading-tight">
          {order.data.rawColor}
        </div>
        <div className="text-lg font-bold text-gray-900 leading-tight">
          Tam: <span className="text-blue-600">{order.data.productSize}</span>
        </div>
      </div>
    </div>

    {/* Detalhes do Bordado */}
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
        <span>{order.data.petCount} Elements</span>
        <span className="text-blue-300">|</span>
        <span className="text-sm font-normal text-blue-800">{order.data.embroideryPosition}</span>
      </div>
      <div className="text-sm text-gray-700 leading-snug">
        <span className="font-bold text-gray-500 text-xs uppercase block mb-0.5">Texto Opcional:</span>
        {order.data.optionalText !== "Não informado" ? `"${order.data.optionalText}"` : "Sem texto"}
      </div>
    </div>

    <button 
      onClick={onAdvance}
      className="w-full bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
    >
      <UploadCloud size={20} />
      <span>Anexar Arquivo & Mover</span>
    </button>
  </CardBase>
);

// --- CARTÃO APROVAÇÃO ---
const ApprovalCard: React.FC<ApprovalCardProps> = ({ order, onApprove, onDragStart, onViewHistory }) => (
  <CardBase order={order} accentColor="border-amber-500" onDragStart={onDragStart} onViewHistory={onViewHistory}>
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-gray-400 uppercase">Cliente</span>
          <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
            <CategoryIcon category={order.data.category} /> {order.data.category}
          </div>
        </div>
        <div className="text-lg font-bold text-gray-900">{order.data.customerName}</div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3">
         <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
         <div>
           <p className="text-sm font-medium text-amber-900">Arquivo aguardando aprovação.</p>
           <p className="text-xs text-amber-700 mt-1">Contate o cliente para liberar a produção.</p>
         </div>
      </div>
    </div>
    
    <button 
      onClick={onApprove}
      className="mt-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
    >
      <CheckCircle2 size={20} />
      <span>Cliente Aprovou (Liberar)</span>
    </button>
  </CardBase>
);

// --- CARTÃO RONEY (PRODUÇÃO) ---
const RoneyCard: React.FC<RoneyCardProps> = ({ order, onFinish, onDragStart, onViewHistory }) => (
  <CardBase order={order} accentColor="border-emerald-500" onDragStart={onDragStart} onViewHistory={onViewHistory}>
    {/* Destaque Visual para Chão de Fábrica - LEITURA RÁPIDA */}
    <div className="flex flex-col gap-4">
      
      {/* Bloco Tamanho e Cor */}
      <div className="flex items-stretch gap-2">
        <div className="bg-gray-900 text-white rounded-lg flex items-center justify-center w-20 h-20 text-3xl font-black shrink-0">
           {order.data.productSize}
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-lg flex-1 flex flex-col justify-center px-4 relative">
           <div className="absolute top-2 right-2">
              <CategoryIcon category={order.data.category} />
           </div>
           <span className="text-xs font-bold text-gray-500 uppercase">Cor da Peça</span>
           <span className="text-xl font-bold text-gray-900 leading-none">{order.data.rawColor}</span>
           <span className="text-xs text-gray-400 mt-1 font-mono">{order.data.sku}</span>
        </div>
      </div>

      {/* Bloco Instruções */}
      <div className="grid grid-cols-2 gap-2">
         <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-center">
            <span className="block text-xs font-bold text-emerald-600 uppercase mb-1">Qtd</span>
            <span className="block text-2xl font-black text-emerald-800">{order.data.petCount}</span>
         </div>
         <div className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col justify-center text-center">
             <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Posição</span>
             <span className="font-bold text-gray-800 text-sm">{order.data.embroideryPosition}</span>
         </div>
      </div>

      {/* Endereço Discreto no rodapé se precisar conferir */}
      <div className="flex items-start gap-2 text-gray-400 text-xs px-1">
        <MapPin size={12} className="mt-0.5" />
        <span>Envio: {order.data.shippingAddress}</span>
      </div>

    </div>

    <button 
      onClick={onFinish}
      className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
    >
      <Scissors size={24} />
      <span>FINALIZAR PRODUÇÃO</span>
    </button>
  </CardBase>
);