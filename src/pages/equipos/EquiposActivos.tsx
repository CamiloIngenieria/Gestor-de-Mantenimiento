import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Download, Edit2, Trash2, Printer, Eye, Info, ArrowUpDown } from "lucide-react";

const equiposData = [
  { id: "249177", nombre: "Analizador de Biomarcadores", marca: "Vitro Group", modelo: "HybriSpot 12", serie: "100227", placa: "GLI-C-BM-001", codigo: "001", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249186", nombre: "Incubadora", marca: "Thermolyne", modelo: "Dri-Bath", serie: "5352", placa: "GLI-C-BM-002", codigo: "002", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249188", nombre: "Nevera", marca: "Haceb", modelo: "N 272 SE 2P DA T/BI", serie: "D181095750", placa: "GLI-C-APP-001", codigo: "003", ubicacion: "Área de almacén", estado: "Operativo" },
  { id: "249191", nombre: "Pipeta Variable", marca: "Boeco", modelo: "5-50 UL", serie: "ME906572", placa: "GLI-C-ES-005", codigo: "004", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249193", nombre: "Termómetro Digital", marca: "Digital Thermometer", modelo: "NT", serie: "NTI", placa: "GLI-C-MB-001", codigo: "005", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249194", nombre: "Cabina de Bioseguridad", marca: "Lumes", modelo: "BA206", serie: "14092302", placa: "GLI-C-BM-003", codigo: "006", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249195", nombre: "Incubadora", marca: "WTC Binder", modelo: "7B532", serie: "3002807000100", placa: "GLI-C-MB-002", codigo: "007", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249201", nombre: "Termómetro de Nevera", marca: "Alla France", modelo: "91000-009/A", serie: "NTI", placa: "GLI-C-APP-021", codigo: "008", ubicacion: "Área de almacén", estado: "Operativo" },
  { id: "249205", nombre: "Centrífuga", marca: "Indulab", modelo: "04 Special", serie: "16200", placa: "GLI-C-APP-003", codigo: "009", ubicacion: "Lab Centro", estado: "Operativo" },
  { id: "249206", nombre: "Congelador Vertical", marca: "Mabe", modelo: "ALASKAV30550", serie: "NTI", placa: "GLI-C-APP-004", codigo: "010", ubicacion: "Área de almacén", estado: "Operativo" },
];

// Export named for other modules that import `equiposData`
export const equiposDataExport = equiposData;
export { equiposData };

export default function EquiposActivos() {
  const [filters, setFilters] = useState({
    entidad: "",
    sede: "",
    ubicacion: "",
    serie: "",
    codigo: "",
    placa: "",
    nombre: "",
    marca: "",
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredEquipos = equiposData.filter((eq) => {
    return (
      (!filters.entidad || eq.codigo.includes(filters.entidad)) &&
      (!filters.sede || eq.ubicacion.toLowerCase().includes(filters.sede.toLowerCase())) &&
      (!filters.ubicacion || eq.ubicacion.toLowerCase().includes(filters.ubicacion.toLowerCase())) &&
      (!filters.serie || eq.serie.toLowerCase().includes(filters.serie.toLowerCase())) &&
      (!filters.codigo || eq.codigo.toLowerCase().includes(filters.codigo.toLowerCase())) &&
      (!filters.placa || eq.placa.toLowerCase().includes(filters.placa.toLowerCase())) &&
      (!filters.nombre || eq.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (!filters.marca || eq.marca.toLowerCase().includes(filters.marca.toLowerCase()))
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEquipos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEquipos.map((eq) => eq.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Equipos Activos</h1>
      
      {/* Filtros */}
      <div className="border rounded-lg bg-card p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Entidad</label>
            <Select value={filters.entidad} onValueChange={(val) => handleFilterChange("entidad", val)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Glicol & CIA">Glicol & CIA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Sede</label>
            <Select value={filters.sede} onValueChange={(val) => handleFilterChange("sede", val)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Lab Centro">Lab Centro</SelectItem>
                <SelectItem value="Área de almacén">Área de almacén</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ubicación</label>
            <Input
              placeholder="Búsqueda"
              value={filters.ubicacion}
              onChange={(e) => handleFilterChange("ubicacion", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Serie</label>
            <Input
              placeholder="Búsqueda"
              value={filters.serie}
              onChange={(e) => handleFilterChange("serie", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Código</label>
            <Input
              placeholder="Búsqueda"
              value={filters.codigo}
              onChange={(e) => handleFilterChange("codigo", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Placa</label>
            <Input
              placeholder="Búsqueda"
              value={filters.placa}
              onChange={(e) => handleFilterChange("placa", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Nombre</label>
            <Input
              placeholder="Búsqueda"
              value={filters.nombre}
              onChange={(e) => handleFilterChange("nombre", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Marca</label>
            <Input
              placeholder="Búsqueda"
              value={filters.marca}
              onChange={(e) => handleFilterChange("marca", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setFilters({ entidad: "", sede: "", ubicacion: "", serie: "", codigo: "", placa: "", nombre: "", marca: "" })
            }
          >
            Limpiar filtros
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button size="icon" variant="outline" title="Información">
            <Info className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" title="Filtro">
            <Filter className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" title="Ordenar">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" title="Descargar">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" title="Imprimir">
            <Printer className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" title="Ver">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Header con contador */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              <span className="text-blue-600">Equipos: {filteredEquipos.length}</span> / {equiposData.length}
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredEquipos.length && filteredEquipos.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Id</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay equipos que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipos.map((eq) => (
                  <TableRow
                    key={eq.id}
                    className={`hover:bg-muted/30 ${selectedIds.includes(eq.id) ? "bg-blue-50" : ""}`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(eq.id)}
                        onChange={() => toggleSelect(eq.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{eq.id}</TableCell>
                    <TableCell className="font-medium">{eq.nombre}</TableCell>
                    <TableCell>{eq.marca}</TableCell>
                    <TableCell>{eq.modelo}</TableCell>
                    <TableCell className="text-sm">{eq.serie}</TableCell>
                    <TableCell className="font-mono text-sm">{eq.placa}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
