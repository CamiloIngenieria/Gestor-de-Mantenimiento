import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Printer, Download, RefreshCw, FileText, Info, Filter, Columns3, X } from "lucide-react";
import * as XLSX from 'xlsx';

interface OrdenServicio {
  id: number;
  numero: string;
  cronogramaId: number;
  equipo: string;
  estado: string;
  tipo: string;
  responsable: string;
  prioridad: string;
  descripcion?: string;
  fechaSolicitud?: string;
  fechaGeneracion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  horasTrabajo?: { hh: number; min: number };
  tiempoTraslado?: { hh: number; min: number };
  equipoDesinfectado?: string;
  instructivo?: string;
  presenciaFugas?: string;
  equipoParado?: string;
  pararOrden?: string;
  trabajosRealizados?: string;
  observaciones?: string;
  activarPlantilla?: boolean;
  equipos?: Array<{ nombre: string; marca: string; modelo: string; serie: string; placa: string; ubicacion: string }>;
  repuestos?: Array<{ nombre: string; referencia: string; serie: string; codigo: string; numLote: string; costo: number; costUsd: number; bodega: string }>;
  repuestoNotes?: string;
  documentos?: Array<{ tipo: string; archivo: string }>;
  // Datos del cronograma asociado
  cronogramaNombre?: string;
  cronogramaEntidad?: string;
  cronogramaSede?: string;
  cronogramaEquipos?: Array<{ id: string; nombre: string; alias?: string; marca?: string; serial?: string }>;
}

const STORAGE_KEY = "gm_ordenes_v1";

export default function OrdenesPendientes() {
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<OrdenServicio | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openColumns, setOpenColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    numero: true,
    prioridad: true,
    equipo: true,
    descripcion: true,
    responsable: true,
  });

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    try {
      const parsed = JSON.parse(raw);
      setOrdenes(parsed.filter((o: OrdenServicio) => o.estado !== "Terminada"));
    } catch (e) {
      console.error(e);
      setOrdenes([]);
    }
  };

  const refresh = () => load();

  const saveOrder = (orden: OrdenServicio) => {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = raw.map((o: OrdenServicio) => (o.id === orden.id ? orden : o));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    load();
  };

  const onEdit = (orden: OrdenServicio) => {
    setSelected({ ...orden });
    setOpenEdit(true);
  };

  const onDelete = (orden: OrdenServicio) => {
    if (!confirm("¿Eliminar orden?")) return;
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = raw.filter((o: OrdenServicio) => o.id !== orden.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    load();
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) { alert("Selecciona al menos una orden"); return; }
    if (!confirm(`¿Eliminar ${selectedIds.length} orden(es)?`)) return;
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = raw.filter((o: OrdenServicio) => !selectedIds.includes(o.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setSelectedIds([]);
    load();
  };

  const closeOrder = (orden: OrdenServicio) => {
    if (!confirm("Marcar orden como terminada?")) return;
    const updated = { ...orden, estado: "Terminada" };
    saveOrder(updated);
    alert("Orden cerrada y movida a Órdenes terminadas.");
  };

  const applyEdit = () => {
    if (!selected) return;
    saveOrder(selected);
    setOpenEdit(false);
    setSelected(null);
  };

  const printSingle = (orden: OrdenServicio) => {
    const html = `
      <html><head><title>Orden ${orden.numero}</title></head>
      <body style="font-family:Arial;padding:20px;">
        <h1>ORDEN DE SERVICIO ${orden.numero}</h1>
        <p><strong>Equipo:</strong> ${orden.equipo}</p>
        <p><strong>Responsable:</strong> ${orden.responsable}</p>
        <p><strong>Tipo:</strong> ${orden.tipo}</p>
        <p><strong>Prioridad:</strong> ${orden.prioridad}</p>
        <p><strong>Descripción:</strong> ${orden.descripcion || ''}</p>
        <p><strong>Trabajos realizados:</strong> ${orden.trabajosRealizados || ''}</p>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const printMultiple = () => {
    if (selectedIds.length === 0) { alert("Selecciona al menos una orden"); return; }
    const selected = ordenes.filter((o) => selectedIds.includes(o.id));
    const html = `
      <html><head><title>Órdenes resumidas</title></head>
      <body style="font-family:Arial;padding:20px;">
        <h1>ÓRDENES PENDIENTES RESUMIDAS</h1>
        <table style="width:100%;border-collapse:collapse;border:1px solid #ccc;">
          <tr>
            <th style="border:1px solid #ccc;padding:8px;">Número</th>
            <th style="border:1px solid #ccc;padding:8px;">Equipo</th>
            <th style="border:1px solid #ccc;padding:8px;">Responsable</th>
            <th style="border:1px solid #ccc;padding:8px;">Prioridad</th>
          </tr>
          ${selected.map((o) => `<tr>
            <td style="border:1px solid #ccc;padding:8px;">${o.numero}</td>
            <td style="border:1px solid #ccc;padding:8px;">${o.equipo}</td>
            <td style="border:1px solid #ccc;padding:8px;">${o.responsable}</td>
            <td style="border:1px solid #ccc;padding:8px;">${o.prioridad}</td>
          </tr>`).join('')}
        </table>
      </body></html>
    `;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const exportExcel = () => {
    if (ordenes.length === 0) { alert("No hay órdenes para exportar"); return; }
    const data = ordenes.map((o) => ({
      Número: o.numero,
      Equipo: o.equipo,
      Responsable: o.responsable,
      Prioridad: o.prioridad,
      Descripción: o.descripcion || '',
      Tipo: o.tipo,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Órdenes");
    XLSX.writeFile(wb, "ordenes_pendientes.xlsx");
  };

  const filtered = ordenes.filter((o) => {
    const q = filter.toLowerCase();
    return (
      o.numero.toLowerCase().includes(q) ||
      o.equipo.toLowerCase().includes(q) ||
      (o.responsable || "").toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((o) => o.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Órdenes pendientes</h1>
          <Input
            placeholder="Buscar..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" title="Información"><Info className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setOpenColumns(true)} title="Seleccionar columnas"><Columns3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={refresh} title="Actualizar"><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => selectedIds.length > 0 && printSingle(ordenes.find((o) => o.id === selectedIds[0])!)} title="Imprimir resumidas"><Printer className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={printMultiple} title="Imprimir múltiple"><Printer className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => selectedIds.length > 0 && onEdit(ordenes.find((o) => o.id === selectedIds[0])!)} title="Editar orden seleccionada"><Edit3 className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={deleteSelected} title="Eliminar orden seleccionada"><Trash2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={exportExcel} title="Exportar Excel"><Download className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded bg-card p-4 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              {visibleColumns.numero && <TableHead>Número</TableHead>}
              {visibleColumns.prioridad && <TableHead>Prioridad</TableHead>}
              {visibleColumns.equipo && <TableHead>Equipo</TableHead>}
              {visibleColumns.descripcion && <TableHead>Descripción</TableHead>}
              {visibleColumns.responsable && <TableHead>Responsable</TableHead>}
              <TableHead className="w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay órdenes pendientes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow
                  key={o.id}
                  className={`hover:bg-muted/30 ${selectedIds.includes(o.id) ? "bg-blue-50" : ""}`}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(o.id)}
                      onChange={() => toggleSelect(o.id)}
                    />
                  </TableCell>
                  {visibleColumns.numero && <TableCell className="font-medium">{o.numero}</TableCell>}
                  {visibleColumns.prioridad && <TableCell><Badge>{o.prioridad}</Badge></TableCell>}
                  {visibleColumns.equipo && <TableCell>{o.equipo}</TableCell>}
                  {visibleColumns.descripcion && <TableCell className="truncate">{o.descripcion || '-'}</TableCell>}
                  {visibleColumns.responsable && <TableCell>{o.responsable}</TableCell>}
                  <TableCell className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(o)}><Edit3 className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => closeOrder(o)}><FileText className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(o)}><Trash2 className="h-3 w-3" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Column selection dialog */}
      <Dialog open={openColumns} onOpenChange={setOpenColumns}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar columnas</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {Object.keys(visibleColumns).map((col) => (
              <label key={col} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleColumns[col as keyof typeof visibleColumns]}
                  onChange={(e) =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [col]: e.target.checked,
                    }))
                  }
                />
                <span className="capitalize">{col}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenColumns(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit order dialog (comprehensive) */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar orden</DialogTitle>
            <DialogDescription>Modifica todos los datos de la orden de servicio</DialogDescription>
            <button
              onClick={() => setOpenEdit(false)}
              className="absolute right-4 top-4 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Sección 1: Datos básicos */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Información básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fecha de solicitud {selected.cronogramaId && <span className="text-red-500">(Bloqueada - desde cronograma)</span>}
                    </label>
                    <Input
                      type="datetime-local"
                      value={selected.fechaSolicitud || selected.fechaGeneracion || ''}
                      onChange={(e) => !selected.cronogramaId && setSelected({ ...selected, fechaSolicitud: e.target.value })}
                      disabled={!!selected.cronogramaId}
                      className={selected.cronogramaId ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha generación</label>
                    <Input
                      type="datetime-local"
                      value={selected.fechaGeneracion || ''}
                      onChange={(e) => setSelected({ ...selected, fechaGeneracion: e.target.value })}
                      disabled={!!selected.cronogramaId}
                      className={selected.cronogramaId ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Descripción de solicitud</label>
                  <textarea
                    value={selected.descripcion || ''}
                    onChange={(e) => setSelected({ ...selected, descripcion: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Sección 2: Activar plantilla */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Activar plantilla de orden</h3>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={selected.activarPlantilla || false}
                    onChange={(e) => setSelected({ ...selected, activarPlantilla: e.target.checked })}
                  />
                  <span className="text-sm">Activar plantilla</span>
                </label>
                
                {selected.activarPlantilla && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de generación</label>
                      <Select value={selected.tipo || ''} onValueChange={(v) => setSelected({ ...selected, tipo: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Orden interna">Orden interna</SelectItem>
                          <SelectItem value="Orden externa">Orden externa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Responsable</label>
                      <Input
                        value={selected.responsable || ''}
                        onChange={(e) => setSelected({ ...selected, responsable: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 3: Fechas de trabajo */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Fechas de trabajo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Inicio de trabajo</label>
                    <Input
                      type="datetime-local"
                      value={selected.fechaInicio || ''}
                      onChange={(e) => setSelected({ ...selected, fechaInicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Finaliza trabajo</label>
                    <Input
                      type="datetime-local"
                      value={selected.fechaFin || ''}
                      onChange={(e) => setSelected({ ...selected, fechaFin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Horas y tiempos */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Horas de trabajo</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium">HH</label>
                    <Input
                      type="number"
                      value={selected.horasTrabajo?.hh || 0}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          horasTrabajo: { hh: parseInt(e.target.value) || 0, min: selected.horasTrabajo?.min || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">min</label>
                    <Input
                      type="number"
                      value={selected.horasTrabajo?.min || 0}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          horasTrabajo: { hh: selected.horasTrabajo?.hh || 0, min: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sección 5: Tiempo traslado */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Tiempo traslado</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium">HH</label>
                    <Input
                      type="number"
                      value={selected.tiempoTraslado?.hh || 0}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          tiempoTraslado: { hh: parseInt(e.target.value) || 0, min: selected.tiempoTraslado?.min || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">min</label>
                    <Input
                      type="number"
                      value={selected.tiempoTraslado?.min || 0}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          tiempoTraslado: { hh: selected.tiempoTraslado?.hh || 0, min: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sección 6: Verificaciones */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Verificaciones</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Se recibe equipo desinfectado</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected.equipoDesinfectado === 'No'}
                          onChange={() => setSelected({ ...selected, equipoDesinfectado: 'No' })}
                        />
                        No
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected.equipoDesinfectado === 'Si'}
                          onChange={() => setSelected({ ...selected, equipoDesinfectado: 'Si' })}
                        />
                        Si
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Instructivo</label>
                    <Select value={selected.instructivo || ''} onValueChange={(v) => setSelected({ ...selected, instructivo: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventivo">Preventivo</SelectItem>
                        <SelectItem value="Correctivo">Correctivo</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Presencia de fugas</label>
                    <Select value={selected.presenciaFugas || ''} onValueChange={(v) => setSelected({ ...selected, presenciaFugas: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Si">Si</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Equipo parado</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected.equipoParado === 'No'}
                          onChange={() => setSelected({ ...selected, equipoParado: 'No' })}
                        />
                        No
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected.equipoParado === 'Si'}
                          onChange={() => setSelected({ ...selected, equipoParado: 'Si' })}
                        />
                        Si
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Parar orden</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected.pararOrden === 'No'}
                          onChange={() => setSelected({ ...selected, pararOrden: 'No' })}
                        />
                        No
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected.pararOrden === 'Si'}
                          onChange={() => setSelected({ ...selected, pararOrden: 'Si' })}
                        />
                        Si
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 7: Trabajos realizados */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Trabajos realizados</h3>
                <textarea
                  value={selected.trabajosRealizados || ''}
                  onChange={(e) => setSelected({ ...selected, trabajosRealizados: e.target.value })}
                  className="w-full border rounded px-3 py-2 min-h-[100px]"
                  placeholder="Descripción de trabajos realizados..."
                />
              </div>

              {/* Sección 8: Información del equipo (desde cronograma) */}
              {selected.cronogramaEquipos && selected.cronogramaEquipos.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Información del equipo</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Alias</TableHead>
                          <TableHead>Marca</TableHead>
                          <TableHead>Serial</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.cronogramaEquipos.map((eq) => (
                          <TableRow key={eq.id}>
                            <TableCell className="font-medium">{eq.nombre}</TableCell>
                            <TableCell>{eq.alias || '-'}</TableCell>
                            <TableCell>{eq.marca || '-'}</TableCell>
                            <TableCell>{eq.serial || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Sección 9: Repuestos */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Repuestos</h3>
                {selected.repuestos && selected.repuestos.length > 0 ? (
                  <div className="overflow-x-auto mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Referencia</TableHead>
                          <TableHead>Serie</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Costo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.repuestos.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.nombre}</TableCell>
                            <TableCell>{r.referencia}</TableCell>
                            <TableCell>{r.serie}</TableCell>
                            <TableCell>{r.codigo}</TableCell>
                            <TableCell>${r.costo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay repuestos registrados</p>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Notas sobre repuestos</label>
                  <textarea
                    value={selected.repuestoNotes || ''}
                    onChange={(e) => setSelected({ ...selected, repuestoNotes: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[60px]"
                  />
                </div>
              </div>

              {/* Sección 10: Observaciones */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Observaciones</h3>
                <textarea
                  value={selected.observaciones || ''}
                  onChange={(e) => setSelected({ ...selected, observaciones: e.target.value })}
                  className="w-full border rounded px-3 py-2 min-h-[60px]"
                />
              </div>

              {/* Sección 11: Documentos */}
              <div>
                <h3 className="font-semibold mb-3">Agregar documentos</h3>
                <div className="border-2 border-dashed rounded p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arrastra archivos aquí para agregar documentos</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
            <Button onClick={applyEdit} className="bg-blue-600 hover:bg-blue-700">
              Guardar y cerrar orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
