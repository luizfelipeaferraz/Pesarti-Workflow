import React, { useState } from 'react';
import { Shirt, ArrowRight, User, KeyRound, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Por favor, selecione um usuário.');
      return;
    }

    if (password === 'Pesarti@2026') {
      onLogin(selectedUser);
    } else {
      setError('Senha incorreta. Acesso negado.');
      setPassword(''); // Limpa a senha para tentar novamente
    }
  };

  const users = [
    "Raphaela",
    "Luiz Felipe",
    "Marco",
    "Roney",
    "W"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Shirt size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 leading-none tracking-tight">Pesarti</h1>
              <span className="text-xs text-indigo-600 font-bold tracking-[0.2em] uppercase block mt-1">Workflow</span>
            </div>
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-8 sm:p-10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
            <p className="text-gray-500 mb-6 text-sm">Identifique-se para acessar o painel.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Seleção de Usuário */}
              <div>
                <label htmlFor="user-select" className="block text-sm font-bold text-gray-700 mb-2">
                  Usuário
                </label>
                <div className="relative">
                  <select
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                    className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 pr-10 transition-all font-medium cursor-pointer hover:bg-gray-100"
                  >
                    <option value="" disabled>Selecione seu nome...</option>
                    {users.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <User size={18} />
                  </div>
                </div>
              </div>

              {/* Campo de Senha */}
              <div>
                <label htmlFor="password-input" className="block text-sm font-bold text-gray-700 mb-2">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 pr-10 transition-all font-medium placeholder:text-gray-300"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <KeyRound size={18} />
                  </div>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
                  <AlertCircle size={16} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedUser || !password}
                className={`
                  w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all mt-2
                  ${selectedUser && password
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'}
                `}
              >
                <span>Entrar no Workflow</span>
                {selectedUser && password && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-8">
          &copy; {new Date().getFullYear()} Pesarti. Sistema de Gestão Interna.
        </p>
      </div>
    </div>
  );
};