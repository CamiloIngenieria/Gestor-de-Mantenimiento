import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Building2,
  Truck,
  FileText,
  ClipboardList,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/",
  },
  {
    title: "Cronogramas",
    icon: <Calendar className="h-5 w-5" />,
    subItems: [
      { title: "Cronograma Mensual", path: "/cronogramas/mensual" },
      { title: "Cronograma Anual", path: "/cronogramas/anual" },
    ],
  },
  {
    title: "Almacén",
    icon: <Package className="h-5 w-5" />,
    subItems: [
      { title: "Inventarios", path: "/equipos/inventarios" },
    ],
  },
  {
    title: "Entidades",
    icon: <Building2 className="h-5 w-5" />,
    subItems: [
      { title: "Entidades", path: "/entidades" },
      { title: "Entidades inactivas", path: "/entidades/inactivas" },
      { title: "Sedes", path: "/entidades/sedes" },
      { title: "Sedes inactivas", path: "/entidades/sedes-inactivas" },
    ],
  },
  {
    title: "Proveedores",
    icon: <Truck className="h-5 w-5" />,
    path: "/proveedores",
  },
  {
    title: "Solicitudes",
    icon: <FileText className="h-5 w-5" />,
    subItems: [
      { title: "Solicitudes abiertas", path: "/solicitudes/abiertas" },
    ],
  },
  {
    title: "Órdenes",
    icon: <ClipboardList className="h-5 w-5" />,
    subItems: [
      { title: "Órdenes pendientes", path: "/ordenes/pendientes" },
      { title: "Órdenes terminadas", path: "/ordenes/terminadas" },
    ],
  },
  {
    title: "Equipos",
    icon: <Settings className="h-5 w-5" />,
    subItems: [
      { title: "Equipos Activos", path: "/equipos/activos" },
      { title: "Equipos Retirados", path: "/equipos/retirados" },
      { title: "Informe Documental", path: "/equipos/informe" },
      { title: "Trazabilidad", path: "/equipos/trazabilidad" },
      { title: "Movimientos", path: "/equipos/movimientos" },
      { title: "Inventarios", path: "/equipos/inventarios" },
    ],
  },
  {
    title: "Tipos de Equipos",
    icon: <Settings className="h-5 w-5" />,
    path: "/tipos-equipos",
  },
  {
    title: "Indicadores",
    icon: <BarChart3 className="h-5 w-5" />,
    path: "/indicadores",
  },
];

export const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          {/* Inline SVG logo: gear + wrench for maintenance, accessible */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary p-1">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 2a1 1 0 0 1 1 1v1.07a6.5 6.5 0 0 1 2.28.93l.76-.76a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 0 1 0 1.42l-.76.76c.32.72.5 1.5.5 2.33H22a1 1 0 1 1 0 2h-1.07a6.5 6.5 0 0 1-.93 2.28l.76.76a1 1 0 0 1 0 1.42l-1.06 1.06a1 1 0 0 1-1.42 0l-.76-.76a6.5 6.5 0 0 1-2.28.93V21a1 1 0 1 1-2 0v-1.07a6.5 6.5 0 0 1-2.28-.93l-.76.76a1 1 0 0 1-1.42 0L3.7 19.3a1 1 0 0 1 0-1.42l.76-.76A6.5 6.5 0 0 1 3.24 14H2a1 1 0 1 1 0-2h1.07c.08-.83.28-1.61.6-2.33l-.76-.76a1 1 0 0 1 0-1.42L4 3.77a1 1 0 0 1 1.42 0l.76.76c.72-.32 1.5-.5 2.33-.5V3a1 1 0 0 1 1-1h2z" fill="#ffffff" />
                <path d="M14.5 9.5l-5 5" stroke="#f3f4f6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.5 8.5l.7-.7a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1 0 1.4L18 11" stroke="#f3f4f6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Gestor Mantenimiento</span>
              <span className="text-xs text-sidebar-foreground/70">Camilo López</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 h-[calc(100vh-64px)] overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-sidebar">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.title) && (
                    <ul className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path}>
                          <NavLink
                            to={subItem.path}
                            className="block rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                          >
                            {subItem.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path!}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
