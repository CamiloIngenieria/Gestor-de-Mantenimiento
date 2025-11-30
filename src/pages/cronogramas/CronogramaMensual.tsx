import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Home,
  Calendar as CalendarIcon,
  Eye,
  Plus,
  Trash2,
  Copy,
  Edit3,
  FileText,
  Share2,
  FileUp,
  X,
  Share,
  List,
} from "lucide-react";
import { format, addMonths, startOfMonth, getDaysInMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface Cronograma {
  id: number;
  nombre: string;
  entidad: string;
  sede: string;
  tipoServicio: string;
  tipo: string;
  tipoEjecucion: string;
  responsable: string;
  fecha: string;
  descripcion: string;
  estado?: string;
  equipos: Array<{ id: string; nombre: string; alias?: string; marca?: string; serial?: string }>;
}

const STORAGE_KEY = "gm_cronogramas_v1";
const ORDENES_STORAGE_KEY = "gm_ordenes_v1";

const tiposServicio = [
  "Calibración",
  "Calificación",
  "Capacitación",
  "Control de Calidad",
  "Correctivo",
  "Evaluación de Desempeño",
  "Instalación",
  "Inventario",
  "Predictivo",
  "Preventivo",
];

const equiposMuestra = [
  { id: "001", nombre: "Equipo de Laboratorio A", alias: "Lab-A", marca: "Marca X", serial: "SN001" },
  { id: "002", nombre: "Equipo de Laboratorio B", alias: "Lab-B", marca: "Marca Y", serial: "SN002" },
  { id: "003", nombre: "Equipo de Laboratorio C", alias: "Lab-C", marca: "Marca Z", serial: "SN003" },
  { id: "004", nombre: "Analizador de Orina", alias: "Analizador", marca: "Urit", serial: "180-57475E", placa: "N.T." },
];

interface OrdenServicio {
  id: number;
  numero: string;
  cronogramaId: number;
  equipo: string;
  estado: string;
  tipo: string;
  responsable: string;
  prioridad: string;
  fechaGeneracion?: string;
  cronogramaNombre?: string;
  cronogramaEntidad?: string;
  cronogramaSede?: string;
  cronogramaEquipos?: Array<{ id: string; nombre: string; alias?: string; marca?: string; serial?: string }>;
}

export default function CronogramaMensual() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openGenerateOrdersDialog, setOpenGenerateOrdersDialog] = useState(false);
  const [openEquiposDialog, setOpenEquiposDialog] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCronograma, setSelectedCronograma] = useState<Cronograma | null>(null);
  const [selectedEntidades, setSelectedEntidades] = useState<Array<{ id: number; nombre: string }>>([]);
  
  const [formData, setFormData] = useState({
    nombre: "",
    entidad: "",
    sede: "",
    tipoServicio: "",
    tipo: "",
    tipoEjecucion: "",
    responsable: "",
    descripcion: "",
    equipos: [] as Array<{ id: string; nombre: string; alias?: string; marca?: string; serial?: string }>,
  });

  const [selectedEquipoId, setSelectedEquipoId] = useState("");
  const [copyDate, setCopyDate] = useState("");
  const [generationConfig, setGenerationConfig] = useState({
    tipoGeneracion: "Orden externa",
    responsable: "",
    generarUnicaOrden: false,
  });

  // Cargar datos
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCronogramas(JSON.parse(raw));
    } catch (e) {
      console.error("Error cargando cronogramas:", e);
    }

    try {
      const entRaw = localStorage.getItem("gm_entidades_v1");
      if (entRaw) {
        const parsed = JSON.parse(entRaw);
        if (Array.isArray(parsed)) {
          setSelectedEntidades(parsed);
        }
      }
    } catch (e) {
      console.error("Error cargando entidades:", e);
    }
  }, []);

  // Guardar cronogramas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cronogramas));
  }, [cronogramas]);

  const openDialogForNewCronograma = (day: number) => {
    const dateStr = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setFormData({
      nombre: "",
      entidad: "",
      sede: "",
      tipoServicio: "",
      tipo: "",
      tipoEjecucion: "",
      responsable: "",
      descripcion: "",
      equipos: [],
    });
    setSelectedEquipoId("");
    setOpenCreateDialog(true);
  };

  const openViewCronograma = (crono: Cronograma) => {
    setSelectedCronograma(crono);
    setOpenViewDialog(true);
  };

  const openCopyCronograma = () => {
    setCopyDate("");
    setOpenCopyDialog(true);
  };

  const openEditCronograma = () => {
    if (!selectedCronograma) return;
    setFormData({
      nombre: selectedCronograma.nombre,
      entidad: selectedCronograma.entidad,
      sede: selectedCronograma.sede,
      tipoServicio: selectedCronograma.tipoServicio,
      tipo: selectedCronograma.tipo,
      tipoEjecucion: selectedCronograma.tipoEjecucion,
      responsable: selectedCronograma.responsable,
      descripcion: selectedCronograma.descripcion,
      equipos: [...selectedCronograma.equipos],
    });
    setOpenViewDialog(false);
    setOpenEditDialog(true);
  };

  const copyCronograma = () => {
    if (!selectedCronograma || !copyDate) {
      alert("Por favor selecciona una fecha");
      return;
    }
    const newCrono: Cronograma = {
      ...selectedCronograma,
      id: Math.max(0, ...cronogramas.map((c) => c.id)) + 1,
      fecha: copyDate,
    };
    setCronogramas([...cronogramas, newCrono]);
    setOpenCopyDialog(false);
    setOpenViewDialog(false);
  };

  const addEquipo = () => {
    if (!selectedEquipoId) return;
    const equipo = equiposMuestra.find((e) => e.id === selectedEquipoId);
    if (!equipo) return;
    if (formData.equipos.find((e) => e.id === selectedEquipoId)) return;
    setFormData({
      ...formData,
      equipos: [...formData.equipos, equipo],
    });
    setSelectedEquipoId("");
  };

  const removeEquipo = (equipoId: string) => {
    setFormData({
      ...formData,
      equipos: formData.equipos.filter((e) => e.id !== equipoId),
    });
  };

  const saveCronograma = () => {
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa un nombre");
      return;
    }
    const newCrono: Cronograma = {
      id: Math.max(0, ...cronogramas.map((c) => c.id)) + 1,
      ...formData,
      fecha: selectedDate,
      estado: "ABIERTO",
    };
    setCronogramas([...cronogramas, newCrono]);
    setOpenCreateDialog(false);
  };

  const updateCronograma = () => {
    if (!selectedCronograma || !formData.nombre.trim()) {
      alert("Por favor ingresa un nombre");
      return;
    }
    const updatedCronogramas = cronogramas.map((c) =>
      c.id === selectedCronograma.id
        ? {
            ...c,
            nombre: formData.nombre,
            entidad: formData.entidad,
            sede: formData.sede,
            tipoServicio: formData.tipoServicio,
            tipo: formData.tipo,
            tipoEjecucion: formData.tipoEjecucion,
            responsable: formData.responsable,
            descripcion: formData.descripcion,
            equipos: formData.equipos,
          }
        : c
    );
    setCronogramas(updatedCronogramas);
    setOpenEditDialog(false);
    setOpenViewDialog(true);
  };

  const deleteCronograma = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cronograma?")) {
      setCronogramas(cronogramas.filter((c) => c.id !== id));
      setOpenViewDialog(false);
    }
  };

  const generateOrders = () => {
    if (!selectedCronograma) return;
    const ordenes: OrdenServicio[] = [];
    const existingOrdenes = JSON.parse(localStorage.getItem(ORDENES_STORAGE_KEY) || "[]");
    let maxOrderId = Math.max(0, ...existingOrdenes.map((o: OrdenServicio) => o.id));

    if (generationConfig.generarUnicaOrden) {
      maxOrderId += 1;
      ordenes.push({
        id: maxOrderId,
        numero: `ORD-${String(maxOrderId).padStart(6, "0")}`,
        cronogramaId: selectedCronograma.id,
        equipo: selectedCronograma.equipos.map((e) => e.nombre).join(", "),
        estado: "Pendiente",
        tipo: generationConfig.tipoGeneracion,
        responsable: generationConfig.responsable,
        prioridad: "Alta",
        fechaGeneracion: selectedCronograma.fecha,
        cronogramaNombre: selectedCronograma.nombre,
        cronogramaEntidad: selectedCronograma.entidad,
        cronogramaSede: selectedCronograma.sede,
        cronogramaEquipos: selectedCronograma.equipos,
      });
    } else {
      selectedCronograma.equipos.forEach((equipo) => {
        maxOrderId += 1;
        ordenes.push({
          id: maxOrderId,
          numero: `ORD-${String(maxOrderId).padStart(6, "0")}`,
          cronogramaId: selectedCronograma.id,
          equipo: equipo.nombre,
          estado: "Pendiente",
          tipo: generationConfig.tipoGeneracion,
          responsable: generationConfig.responsable,
          prioridad: "Alta",
          fechaGeneracion: selectedCronograma.fecha,
          cronogramaNombre: selectedCronograma.nombre,
          cronogramaEntidad: selectedCronograma.entidad,
          cronogramaSede: selectedCronograma.sede,
          cronogramaEquipos: selectedCronograma.equipos,
        });
      });
    }

    const allOrdenes = [...existingOrdenes, ...ordenes];
    localStorage.setItem(ORDENES_STORAGE_KEY, JSON.stringify(allOrdenes));

    // Actualizar estado del cronograma
    const updated = cronogramas.map((c) =>
      c.id === selectedCronograma.id ? { ...c, estado: "GENERADO" } : c
    );
    setCronogramas(updated);

    alert(`Se generaron ${ordenes.length} orden(es) de servicio`);
    setOpenGenerateOrdersDialog(false);
    setOpenViewDialog(false);
  };

  const getCronogramasForDate = (day: number) => {
    const dateStr = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
    return cronogramas.filter((c) => c.fecha === dateStr);
  };

  const firstDay = getDay(startOfMonth(currentMonth));
  const daysInMonth = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Filtrar">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Descargar">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Calendario">
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Inicio">
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Configuración">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Ver">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[180px] text-center">
              {format(currentMonth, "MMMM / yyyy", { locale: es })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="default" size="sm">
              Mes
            </Button>
            <Button variant="outline" size="sm">
              Semana
            </Button>
            <Button variant="outline" size="sm">
              Año
            </Button>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="border rounded-lg bg-card p-6">
        {/* Headers de días */}
        <div className="grid grid-cols-7 gap-0 mb-4">
          {["dom", "lun", "mar", "mié", "jue", "vie", "sáb"].map((day) => (
            <div key={day} className="text-center font-semibold text-foreground py-3 border-b">
              {day}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-0 border border-border rounded">
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[120px] bg-muted/20 border-r border-b border-border"></div>
          ))}
          {days.map((day) => {
            const cronogramasDelDia = getCronogramasForDate(day);
            return (
              <div
                key={day}
                onClick={() => !cronogramasDelDia.length && openDialogForNewCronograma(day)}
                className="min-h-[120px] border-r border-b border-border p-3 cursor-pointer hover:bg-muted/10 transition-colors bg-card"
              >
                <div className="text-sm font-semibold text-muted-foreground mb-2">{day}</div>
                <div className="space-y-1 overflow-y-auto max-h-[100px]">
                  {cronogramasDelDia.map((crono) => (
                    <Badge
                      key={crono.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewCronograma(crono);
                      }}
                      className="block text-xs w-full justify-start bg-green-500/20 text-green-700 border-green-500/30 truncate cursor-pointer hover:bg-green-500/30"
                      title={crono.nombre}
                    >
                      {crono.nombre.substring(0, 25)}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialog: Ver Cronograma */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{selectedCronograma?.nombre}</DialogTitle>
              {selectedCronograma?.descripcion && (
                <DialogDescription className="mt-2">{selectedCronograma.descripcion}</DialogDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenViewDialog(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {selectedCronograma && (
            <div className="space-y-4">
              {/* Botones de acciones */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCopyCronograma}
                  className="gap-2"
                  title="Copiar este cronograma a otra fecha"
                >
                  <Copy className="h-4 w-4" />
                  Copiar cronograma
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditCronograma}
                  className="gap-2"
                  title="Editar cronograma y agregar equipos"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar cronograma
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGenerationConfig({
                      tipoGeneracion: "Orden externa",
                      responsable: selectedCronograma.responsable,
                      generarUnicaOrden: false,
                    });
                    setOpenViewDialog(false);
                    setOpenGenerateOrdersDialog(true);
                  }}
                  className="gap-2"
                  title="Generar órdenes de servicio"
                >
                  <FileText className="h-4 w-4" />
                  Generar órdenes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenEquiposDialog(true)}
                  className="gap-2"
                  title="Ver equipos asociados"
                >
                  <List className="h-4 w-4" />
                  Ver elementos relacionados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  title="Subir archivo"
                >
                  <FileUp className="h-4 w-4" />
                  Subir archivo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  title="Descargar archivo"
                >
                  <Download className="h-4 w-4" />
                  Descargar archivo
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCronograma(selectedCronograma.id)}
                  className="gap-2"
                  title="Eliminar cronograma"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>

              {/* Información del cronograma */}
              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Id del evento:</span>
                  <span className="font-medium">{selectedCronograma.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">{format(new Date(selectedCronograma.fecha), "PPPP", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Cliente / Sede:</span>
                  <span className="font-medium">{selectedCronograma.entidad} / {selectedCronograma.sede}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium">{selectedCronograma.tipoServicio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{selectedCronograma.tipo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant="secondary">{selectedCronograma.estado || "ABIERTO"}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Copiar Cronograma */}
      <Dialog open={openCopyDialog} onOpenChange={setOpenCopyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copiar evento de cronograma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Fecha</label>
              <Input
                type="date"
                value={copyDate}
                onChange={(e) => setCopyDate(e.target.value)}
                placeholder="Selecciona una fecha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCopyDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={copyCronograma} className="bg-blue-600 hover:bg-blue-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Cronograma */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar cronograma</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Fila 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Nombre</label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del cronograma"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Tipo</label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipo Biomedico">Equipo Biomedico</SelectItem>
                    <SelectItem value="Sistemas">Sistemas</SelectItem>
                    <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Entidad</label>
                <Select value={formData.entidad} onValueChange={(value) => setFormData({ ...formData, entidad: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEntidades.map((ent) => (
                      <SelectItem key={ent.id} value={ent.id.toString()}>
                        {ent.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Sede</label>
                <Input
                  value={formData.sede}
                  onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                  placeholder="Sede"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Tipo de servicio</label>
                <Select
                  value={formData.tipoServicio}
                  onValueChange={(value) => setFormData({ ...formData, tipoServicio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServicio.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 3 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Fecha</label>
                <Input type="date" value={selectedCronograma?.fecha || ""} readOnly className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Tipo de ejecución</label>
                <Select
                  value={formData.tipoEjecucion}
                  onValueChange={(value) => setFormData({ ...formData, tipoEjecucion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interno">Interno</SelectItem>
                    <SelectItem value="Externo">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Responsable</label>
                <Input
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  placeholder="Responsable"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-1">* Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del cronograma"
                className="w-full border rounded px-3 py-2 min-h-[100px]"
              />
            </div>

            {/* Equipos */}
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold mb-3">* Equipos</label>
              <div className="flex gap-2 mb-4">
                <Select value={selectedEquipoId} onValueChange={setSelectedEquipoId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="-- Seleccione un equipo --" />
                  </SelectTrigger>
                  <SelectContent>
                    {equiposMuestra.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.id} - {eq.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addEquipo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {/* Tabla de equipos */}
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead className="w-12 text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.equipos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay registros para visualizar
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.equipos.map((eq) => (
                        <TableRow key={eq.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm">{eq.nombre}</TableCell>
                          <TableCell className="text-sm">{eq.alias || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.marca || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.serial || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEquipo(eq.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {formData.equipos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Total de registros: {formData.equipos.length}</p>
              )}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-card border-t pt-4">
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateCronograma} className="bg-blue-600 hover:bg-blue-700">
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Generar Órdenes */}
      <Dialog open={openGenerateOrdersDialog} onOpenChange={setOpenGenerateOrdersDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generar órdenes</DialogTitle>
          </DialogHeader>

          {selectedCronograma && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tipo de generación</label>
                  <Select
                    value={generationConfig.tipoGeneracion}
                    onValueChange={(value) =>
                      setGenerationConfig({ ...generationConfig, tipoGeneracion: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Orden externa">Orden externa</SelectItem>
                      <SelectItem value="Orden interna">Orden interna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Responsable</label>
                  <Select
                    value={generationConfig.responsable}
                    onValueChange={(value) =>
                      setGenerationConfig({ ...generationConfig, responsable: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selectedCronograma.responsable || "N/A"}>
                        {selectedCronograma.responsable || "N/A"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={generationConfig.generarUnicaOrden}
                      onChange={(e) =>
                        setGenerationConfig({ ...generationConfig, generarUnicaOrden: e.target.checked })
                      }
                    />
                    <span className="text-sm">generar única orden</span>
                  </label>
                </div>
              </div>

              {/* Tabla de equipos */}
              <div className="border rounded overflow-hidden">
                <div className="bg-muted px-4 py-2 font-semibold text-sm">
                  Equipos relacionados
                </div>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Id orden</TableHead>
                      <TableHead>Estado de la orden</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Placa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCronograma.equipos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No hay equipos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedCronograma.equipos.map((eq, idx) => (
                        <TableRow key={eq.id} className="hover:bg-muted/30">
                          <TableCell className="text-sm text-center">
                            <input type="checkbox" />
                          </TableCell>
                          <TableCell className="text-sm"></TableCell>
                          <TableCell className="text-sm"></TableCell>
                          <TableCell className="font-medium text-sm">{eq.nombre}</TableCell>
                          <TableCell className="text-sm">{eq.alias || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.marca || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.serial || "-"}</TableCell>
                          <TableCell className="text-sm">{(eq as any).placa || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground">
                Total de registros: {selectedCronograma.equipos.length}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenGenerateOrdersDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={generateOrders} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" />
              Generar órdenes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Equipos Relacionados */}
      <Dialog open={openEquiposDialog} onOpenChange={setOpenEquiposDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Elementos relacionados</DialogTitle>
          </DialogHeader>

          {selectedCronograma && (
            <div className="space-y-4">
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Ubicación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCronograma.equipos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No hay equipos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedCronograma.equipos.map((eq) => (
                        <TableRow key={eq.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm">{eq.nombre}</TableCell>
                          <TableCell className="text-sm">{eq.alias || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.marca || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.serial || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.id}</TableCell>
                          <TableCell className="text-sm">-</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setOpenEquiposDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear Cronograma */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear cronograma</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo cronograma para {selectedDate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Fila 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Nombre</label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del cronograma"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Tipo</label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipo Biomedico">Equipo Biomedico</SelectItem>
                    <SelectItem value="Sistemas">Sistemas</SelectItem>
                    <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Entidad</label>
                <Select value={formData.entidad} onValueChange={(value) => setFormData({ ...formData, entidad: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEntidades.map((ent) => (
                      <SelectItem key={ent.id} value={ent.id.toString()}>
                        {ent.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Sede</label>
                <Input
                  value={formData.sede}
                  onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                  placeholder="Sede"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">* Tipo de servicio</label>
                <Select
                  value={formData.tipoServicio}
                  onValueChange={(value) => setFormData({ ...formData, tipoServicio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServicio.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 3 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Fecha</label>
                <Input type="date" value={selectedDate} readOnly className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Tipo de ejecución</label>
                <Select
                  value={formData.tipoEjecucion}
                  onValueChange={(value) => setFormData({ ...formData, tipoEjecucion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interno">Interno</SelectItem>
                    <SelectItem value="Externo">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Responsable</label>
                <Input
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  placeholder="Responsable"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-1">* Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del cronograma"
                className="w-full border rounded px-3 py-2 min-h-[100px]"
              />
            </div>

            {/* Equipos */}
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold mb-3">* Equipos</label>
              <div className="flex gap-2 mb-4">
                <Select value={selectedEquipoId} onValueChange={setSelectedEquipoId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="-- Seleccione un equipo --" />
                  </SelectTrigger>
                  <SelectContent>
                    {equiposMuestra.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.id} - {eq.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addEquipo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {/* Tabla de equipos */}
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead className="w-12 text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.equipos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay registros para visualizar
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.equipos.map((eq) => (
                        <TableRow key={eq.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm">{eq.nombre}</TableCell>
                          <TableCell className="text-sm">{eq.alias || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.marca || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.serial || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEquipo(eq.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {formData.equipos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Total de registros: {formData.equipos.length}</p>
              )}
            </div>

            {/* Checkbox autoprogramación */}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              <span>Autoprogramación por fecha de creación de cronograma y frecuencia manual.</span>
            </label>
          </div>

          <DialogFooter className="sticky bottom-0 bg-card border-t pt-4">
            <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCronograma} className="bg-blue-600 hover:bg-blue-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
