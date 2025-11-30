import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate authentication delay
    setTimeout(() => {
      setLoading(false);
      // In a real app, validate credentials here
      navigate("/");
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left visual panel */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-500 p-8">
          <div className="w-4/5 text-center">
            <svg viewBox="0 0 120 80" className="mx-auto mb-6" width={260} height={160} aria-hidden>
              <rect x="0" y="0" width="120" height="80" rx="4" fill="#42307a" />
              <circle cx="25" cy="30" r="8" fill="#fff" opacity="0.12" />
              <circle cx="45" cy="30" r="8" fill="#fff" opacity="0.12" />
              <circle cx="65" cy="30" r="8" fill="#fff" opacity="0.12" />
              <rect x="10" y="50" width="100" height="12" rx="2" fill="#fff" opacity="0.08" />
            </svg>
            <h3 className="text-white text-xl font-semibold">Sistema de Gestión de Mantenimiento</h3>
            <p className="mt-3 text-indigo-100 text-sm">Organiza equipos, cronogramas y reportes en un único panel.</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">QS</div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 text-center">Bienvenido</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Por favor ingresa tus credenciales para acceder al sistema.</p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="********"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500" href="#">¿Olvidaste tu contraseña?</a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-md bg-white border border-indigo-600 text-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-50 disabled:opacity-60"
                >
                  {loading ? "Accediendo..." : "Iniciar sesión"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">Versión 3.2.28</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
