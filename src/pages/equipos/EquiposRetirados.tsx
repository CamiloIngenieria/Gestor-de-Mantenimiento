import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";

const columns = [
  { key: "id", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "fechaRetiro", label: "Fecha de Retiro" },
  { key: "motivo", label: "Motivo" },
];

const equiposRetiradosData = [
  {
    id: "003",
    nombre: "Equipo de Laboratorio C",
    marca: "Marca Z",
    modelo: "MZ-1500",
    fechaRetiro: "15/10/2025",
    motivo: "Obsoleto",
  },
];

const EquiposRetirados = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipos Retirados</h1>
          <p className="text-muted-foreground">Historial de equipos fuera de servicio</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar equipos retirados..." className="pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={equiposRetiradosData} />
    </div>
  );
};

export default EquiposRetirados;
