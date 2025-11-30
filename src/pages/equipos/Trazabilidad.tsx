import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const eventos = [
  {
    fecha: "24 Nov 2025",
    hora: "10:30",
    evento: "Mantenimiento Preventivo",
    equipo: "LAB-001",
    responsable: "Ing. Juan Pérez",
    estado: "Completado",
  },
  {
    fecha: "23 Nov 2025",
    hora: "14:15",
    evento: "Calibración",
    equipo: "LAB-002",
    responsable: "Ing. María García",
    estado: "Completado",
  },
  {
    fecha: "22 Nov 2025",
    hora: "09:00",
    evento: "Inspección",
    equipo: "LAB-003",
    responsable: "Téc. Carlos López",
    estado: "En Proceso",
  },
  {
    fecha: "21 Nov 2025",
    hora: "16:45",
    evento: "Reparación",
    equipo: "LAB-004",
    responsable: "Ing. Ana Martínez",
    estado: "Completado",
  },
];

const Trazabilidad = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trazabilidad de Equipos</h1>
        <p className="text-muted-foreground">Historial completo de eventos y mantenimientos</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por equipo, evento o responsable..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {eventos.map((evento, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      evento.estado === "Completado"
                        ? "default"
                        : evento.estado === "En Proceso"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {evento.estado}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {evento.fecha} - {evento.hora}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{evento.evento}</h3>
                  <p className="text-sm text-muted-foreground">Equipo: {evento.equipo}</p>
                </div>
                <p className="text-sm text-foreground">
                  Responsable: <span className="font-medium">{evento.responsable}</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Trazabilidad;
