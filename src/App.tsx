import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy imports para evitar problemas de carga
import { lazy, Suspense } from "react";

const CronogramaMensual = lazy(() => import("./pages/cronogramas/CronogramaMensual"));
const CronogramaAnual = lazy(() => import("./pages/cronogramas/CronogramaAnual"));
const EquiposActivos = lazy(() => import("./pages/equipos/EquiposActivos"));
const EquiposRetirados = lazy(() => import("./pages/equipos/EquiposRetirados"));
const InformeDocumental = lazy(() => import("./pages/equipos/InformeDocumental"));
const Trazabilidad = lazy(() => import("./pages/equipos/Trazabilidad"));
const Movimientos = lazy(() => import("./pages/equipos/Movimientos"));
const Inventarios = lazy(() => import("./pages/equipos/Inventarios"));
const TiposEquipos = lazy(() => import("./pages/TiposEquipos"));
const SolicitudesAbiertas = lazy(() => import("./pages/solicitudes/SolicitudesAbiertas"));
const Entidades = lazy(() => import("./pages/Entidades"));
const EntidadesInactivas = lazy(() => import("./pages/entidades/EntidadesInactivas"));
const Sedes = lazy(() => import("./pages/entidades/Sedes"));
const SedesInactivas = lazy(() => import("./pages/entidades/SedesInactivas"));
const OrdenesPendientes = lazy(() => import("./pages/ordenes/OrdenesPendientes"));
const OrdenesTerminadas = lazy(() => import("./pages/ordenes/OrdenesTerminadas"));
const Proveedores = lazy(() => import("./pages/Proveedores"));
const Indicadores = lazy(() => import("./pages/Indicadores"));

const LoadingFallback = () => <div style={{ padding: "20px" }}>Cargando...</div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/cronogramas/mensual" element={<Suspense fallback={<LoadingFallback />}><CronogramaMensual /></Suspense>} />
                  <Route path="/cronogramas/anual" element={<Suspense fallback={<LoadingFallback />}><CronogramaAnual /></Suspense>} />
                  <Route path="/equipos/activos" element={<Suspense fallback={<LoadingFallback />}><EquiposActivos /></Suspense>} />
                  <Route path="/equipos/retirados" element={<Suspense fallback={<LoadingFallback />}><EquiposRetirados /></Suspense>} />
                  <Route path="/equipos/informe" element={<Suspense fallback={<LoadingFallback />}><InformeDocumental /></Suspense>} />
                  <Route path="/equipos/trazabilidad" element={<Suspense fallback={<LoadingFallback />}><Trazabilidad /></Suspense>} />
                  <Route path="/equipos/movimientos" element={<Suspense fallback={<LoadingFallback />}><Movimientos /></Suspense>} />
                  <Route path="/equipos/inventarios" element={<Suspense fallback={<LoadingFallback />}><Inventarios /></Suspense>} />
                  <Route path="/tipos-equipos" element={<Suspense fallback={<LoadingFallback />}><TiposEquipos /></Suspense>} />
                  <Route path="/entidades" element={<Suspense fallback={<LoadingFallback />}><Entidades /></Suspense>} />
                  <Route path="/entidades/inactivas" element={<Suspense fallback={<LoadingFallback />}><EntidadesInactivas /></Suspense>} />
                  <Route path="/entidades/sedes" element={<Suspense fallback={<LoadingFallback />}><Sedes /></Suspense>} />
                  <Route path="/entidades/sedes-inactivas" element={<Suspense fallback={<LoadingFallback />}><SedesInactivas /></Suspense>} />
                  <Route path="/proveedores" element={<Suspense fallback={<LoadingFallback />}><Proveedores /></Suspense>} />
                  <Route path="/indicadores" element={<Suspense fallback={<LoadingFallback />}><Indicadores /></Suspense>} />
                  <Route path="/ordenes/pendientes" element={<Suspense fallback={<LoadingFallback />}><OrdenesPendientes /></Suspense>} />
                  <Route path="/ordenes/terminadas" element={<Suspense fallback={<LoadingFallback />}><OrdenesTerminadas /></Suspense>} />
                  <Route path="/solicitudes/abiertas" element={<Suspense fallback={<LoadingFallback />}><SolicitudesAbiertas /></Suspense>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
