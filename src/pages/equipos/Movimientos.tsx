import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "equipo", label: "Equipo" },
  { key: "origen", label: "Ubicación Origen" },
  { key: "destino", label: "Ubicación Destino" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
];

const movimientosData = [
  {
    fecha: "24 Nov 2025",
    equipo: "LAB-001",
    origen: "Laboratorio Central",
    destino: "Sede Norte",
    responsable: "Ing. Juan Pérez",
    estado: "Completado",
  },
  {
    fecha: "23 Nov 2025",
    equipo: "LAB-005",
    origen: "Sede Norte",
    destino: "Laboratorio Central",
    responsable: "Téc. María García",
    estado: "En Tránsito",
  },
];

const Movimientos = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movimientos de Equipos</h1>
          <p className="text-muted-foreground">Control de traslados entre ubicaciones</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Movimiento
        </Button>
      </div>

      <DataTable columns={columns} data={movimientosData} />
    </div>
  );
};

export default Movimientos;
