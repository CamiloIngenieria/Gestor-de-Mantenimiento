import { Card } from "@/components/ui/card";
import { BarChart3, Calendar, CheckCircle, AlertCircle } from "lucide-react";

const stats = [
  {
    title: "Órdenes Pendientes",
    value: "24",
    icon: <AlertCircle className="h-6 w-6 text-warning" />,
    trend: "+12%",
  },
  {
    title: "Equipos Activos",
    value: "156",
    icon: <CheckCircle className="h-6 w-6 text-success" />,
    trend: "+3%",
  },
  {
    title: "Mantenimientos Hoy",
    value: "8",
    icon: <Calendar className="h-6 w-6 text-primary" />,
    trend: "-5%",
  },
  {
    title: "Tasa de Cumplimiento",
    value: "94%",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    trend: "+2%",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema de mantenimiento</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.trend} vs mes anterior</p>
              </div>
              <div className="rounded-lg bg-muted p-3">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Próximos Mantenimientos
          </h3>
          <div className="space-y-3">
            {[
              { equipo: "Equipo A-101", fecha: "24 Nov 2025", tipo: "Preventivo" },
              { equipo: "Equipo B-205", fecha: "25 Nov 2025", tipo: "Correctivo" },
              { equipo: "Equipo C-330", fecha: "26 Nov 2025", tipo: "Preventivo" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{item.equipo}</p>
                  <p className="text-sm text-muted-foreground">{item.tipo}</p>
                </div>
                <span className="text-sm text-muted-foreground">{item.fecha}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Alertas Recientes</h3>
          <div className="space-y-3">
            {[
              { mensaje: "Equipo D-450 requiere calibración", prioridad: "Alta" },
              { mensaje: "Inventario de repuestos bajo", prioridad: "Media" },
              { mensaje: "Actualización de cronograma mensual", prioridad: "Baja" },
            ].map((alerta, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{alerta.mensaje}</p>
                  <p className="text-xs text-muted-foreground">Prioridad: {alerta.prioridad}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
