import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Info, Filter, RefreshCw, Plus, Edit, X, FileText, Download, Trash2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState, useEffect, useMemo } from "react";
import { equiposData as equiposActivos } from "@/pages/equipos/EquiposActivos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Solicitud {
  id: number;
  numero: string;
  prioridad: string;
  estado: string;
  ordenes: string;
  descripcion: string;
  area: string;
  ciudad: string;
  fecha: string;
  equipoId?: string;
  equipoNombre?: string;
}

const STORAGE_KEY = "gm_solicitudes_v1";

const sampleData: Solicitud[] = [
  { id: 1, numero: "REQ-001", prioridad: "Alta", estado: "Abierta", ordenes: "0", descripcion: "Fallo en motor principal", area: "Mantenimiento", ciudad: "Pasto", fecha: "2025-11-20", equipoId: equiposActivos[0]?.id ?? "001", equipoNombre: equiposActivos[0]?.nombre ?? "Equipo A" },
  { id: 2, numero: "REQ-002", prioridad: "Media", estado: "Abierta", ordenes: "1", descripcion: "Revisión preventiva equipo A", area: "Operaciones", ciudad: "Pasto", fecha: "2025-11-21", equipoId: equiposActivos[1]?.id ?? "002", equipoNombre: equiposActivos[1]?.nombre ?? "Equipo B" },
];

const SolicitudesAbiertas = () => {
  const [search, setSearch] = useState("");
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [editing, setEditing] = useState<Solicitud | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [form, setForm] = useState({ numero: "", prioridad: "Media", estado: "Abierta", ordenes: "0", descripcion: "", area: "", ciudad: "", equipoId: "" });
  const [entidades, setEntidades] = useState<Array<{id:number; nombre:string}>>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setSolicitudes(JSON.parse(stored)); }
      catch { setSolicitudes(sampleData); }
    } else {
      setSolicitudes(sampleData);
    }
    // load entidades from general module storage
    try {
      const raw = localStorage.getItem('gm_entidades_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setEntidades(parsed.map((e:any)=>({ id: e.id, nombre: e.nombre })));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
  }, [solicitudes]);

  const filtered = useMemo(() => {
    return solicitudes.filter(s => (
      s.numero.toLowerCase().includes(search.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      s.area.toLowerCase().includes(search.toLowerCase()) ||
      s.ciudad.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, solicitudes]);

  const handleSelectRow = (id: number) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedRows(next);
  };

  const generateOrder = (s: Solicitud) => {
    const ORDEN_KEY = 'gm_ordenes_v1';
    try {
      const raw = JSON.parse(localStorage.getItem(ORDEN_KEY) || '[]');
      const nextId = (raw.reduce((max: any, o: any) => Math.max(max, o.id || 0), 0) || 0) + 1;
      const numero = `ORD-${String(nextId).padStart(4, '0')}`;
      const nueva = {
        id: nextId,
        numero,
        equipo: s.equipoNombre || s.equipoId || '-',
        estado: 'Pendiente',
        tipo: (s as any).tipoServicio || 'Correctivo',
        responsable: '',
        prioridad: s.prioridad || 'Media',
        descripcion: s.descripcion || '',
        fechaGeneracion: new Date().toLocaleString(),
      };
      raw.push(nueva);
      localStorage.setItem(ORDEN_KEY, JSON.stringify(raw));
      setSolicitudes(prev => prev.map(x => x.id === s.id ? { ...x, ordenes: String((Number(x.ordenes) || 0) + 1) } : x));
      toast({ title: 'Orden generada', description: `Orden ${numero} creada` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo crear la orden', variant: 'destructive' });
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filtered.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filtered.map(s => s.id)));
  };

  const openAdd = () => { setEditing(null); setForm({ numero: "", prioridad: "Media", estado: "Abierta", ordenes: "0", descripcion: "", area: "", ciudad: "", equipoId: "" }); setOpenAddEdit(true); };
  const openEdit = (s: Solicitud) => { setEditing(s); setForm({ numero: s.numero, prioridad: s.prioridad, estado: s.estado, ordenes: s.ordenes, descripcion: s.descripcion, area: s.area, ciudad: s.ciudad, equipoId: s.equipoId ?? "" }); setOpenAddEdit(true); };

  const save = () => {
    if (!form.numero) { toast({ title: 'Error', description: 'Número es requerido', variant: 'destructive' }); return; }
    if (editing) {
      setSolicitudes(solicitudes.map(s => s.id === editing.id ? { ...s, ...form, equipoNombre: equiposActivos.find(e=>e.id===form.equipoId)?.nombre ?? s.equipoNombre } as Solicitud : s));
      toast({ title: 'Actualizado', description: 'Solicitud actualizada' });
    } else {
      const id = Math.max(0, ...solicitudes.map(s => s.id)) + 1;
      setSolicitudes([...solicitudes, { id, fecha: new Date().toLocaleDateString(), ...form, equipoNombre: equiposActivos.find(e=>e.id===form.equipoId)?.nombre ?? "" } as Solicitud]);
      toast({ title: 'Creada', description: 'Solicitud agregada' });
    }
    setOpenAddEdit(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (selectedRows.size === 0) { toast({ title: 'Seleccione', description: 'Selecciona al menos una solicitud', variant: 'destructive' }); return; }
    setSolicitudes(solicitudes.filter(s => !selectedRows.has(s.id)));
    setSelectedRows(new Set());
    setOpenDelete(false);
    toast({ title: 'Eliminadas', description: 'Solicitudes eliminadas' });
  };

  const exportCSV = () => {
    if (selectedRows.size === 0) { toast({ title: 'Seleccione', description: 'Selecciona filas para exportar', variant: 'destructive' }); return; }
    const rows = solicitudes.filter(s => selectedRows.has(s.id));
    const csv = [ ['ID','Número','Prioridad','Estado','Órdenes','Descripción','Área','Ciudad','Fecha'].join(','), ...rows.map(r => [r.id,r.numero,r.prioridad,r.estado,r.ordenes,`"${r.descripcion}"`,r.area,r.ciudad,r.fecha].join(',')) ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'solicitudes.csv'; a.click(); URL.revokeObjectURL(url); toast({ title: 'Exportado', description: `${rows.length} filas exportadas` });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">📞</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes abiertas : {solicitudes.length} / 0</h1>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Info', description: 'Información del módulo' })}><Info size={16} /></Button>
          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Filtro', description: 'Abrir filtros (no implementado)' })}><Filter size={16} /></Button>
          <Button size="sm" variant="outline" onClick={() => { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setSolicitudes(JSON.parse(stored)); toast({ title: 'Refrescar', description: 'Datos recargados' }); }}><RefreshCw size={16} /></Button>
          <Button size="sm" variant="outline" onClick={exportCSV}><FileText size={16} /></Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={openAdd}><Plus size={16} /></Button>
          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => { if (selectedRows.size===1) { const id = Array.from(selectedRows)[0]; const s = solicitudes.find(x=>x.id===id); if (s) openEdit(s); } else toast({ title: 'Editar', description: 'Selecciona una sola solicitud para editar', variant: 'destructive' }); }}><Edit size={16} /></Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setOpenDelete(true)}><X size={16} /></Button>
        </div>
      </div>

      <Card className="border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-12"><input type="checkbox" className="w-4 h-4" checked={selectedRows.size===filtered.length && filtered.length>0} onChange={handleSelectAll} /></TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Órdenes</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Ciudad, Regional</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length===0 ? (
                <TableRow><TableCell colSpan={10} className="py-20 text-center text-gray-500">No Rows To Show</TableCell></TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell><input type="checkbox" className="w-4 h-4" checked={selectedRows.has(row.id)} onChange={() => handleSelectRow(row.id)} /></TableCell>
                    <TableCell className="font-medium">{row.numero}</TableCell>
                    <TableCell>{row.prioridad}</TableCell>
                    <TableCell>{row.estado}</TableCell>
                    <TableCell>{row.ordenes}</TableCell>
                    <TableCell className="truncate max-w-md">{row.descripcion}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell className="max-w-xs truncate">{row.equipoNombre || '-'}</TableCell>
                    <TableCell>{row.ciudad}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => toast({ title: row.numero, description: row.descripcion })} title="Info"><Info size={16} /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => openEdit(row)} title="Editar"><Edit size={16} /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => { setSelectedRows(new Set([row.id])); setOpenDelete(true); }} title="Eliminar"><Trash2 size={16} /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => generateOrder(row)} title="Generar orden"><FileText size={16} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openAddEdit} onOpenChange={setOpenAddEdit}>
        <DialogContent className="sm:max-w-4xl w-full max-h-[85vh] overflow-hidden">
            <DialogHeader>
            <DialogTitle>{editing ? 'Editar Solicitud' : 'Nueva Solicitud'}</DialogTitle>
            <DialogDescription>{editing ? 'Actualiza los datos de la solicitud' : 'Crea una nueva solicitud'}</DialogDescription>
          </DialogHeader>
              <div className="space-y-3">
                <div className="overflow-y-auto max-h-[68vh] pr-3">
            <div>
              <label className="block text-sm mb-1">Número</label>
              <Input value={form.numero} onChange={(e)=>setForm({...form, numero: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Fecha de solicitud</label>
                <Input readOnly value={editing ? (editing.fecha) : new Date().toLocaleString()} />
              </div>
              <div>
                <label className="block text-sm mb-1">Nombre del personal</label>
                <Input value={(form as any).nombrePersonal || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                  nombrePersonal: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Tipo de servicio técnico</label>
                <select className="input" value={(form as any).tipoServicio || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                  tipoServicio: e.target.value})}>
                  <option value="">Seleccione...</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Preventivo">Preventivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Tipo de solicitud</label>
                <select className="input" value={(form as any).tipoSolicitud || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                  tipoSolicitud: e.target.value})}>
                  <option value="">Seleccione...</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Inspección">Inspección</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Solicitante</label>
                <Input value={(form as any).solicitante || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                  solicitante: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">N° de contacto</label>
                <Input value={(form as any).contacto || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                  contacto: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm mb-1">Entidad</label>
                  <select className="input" value={(form as any).entidad || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                    entidad: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {entidades.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.nombre}</option>
                    ))}
                  </select>
                </div>
              <div>
                <label className="block text-sm mb-1">Sede</label>
                <Input value={(form as any).sede || ''} onChange={(e)=>setForm({...form, // @ts-ignore
                  sede: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">Área</label>
                <Input value={(form as any).area || ''} onChange={(e)=>setForm({...form, area: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Equipo (asociar)</label>
              <select className="input w-full" value={(form as any).equipoId || ''} onChange={(e)=>setForm({...form, equipoId: e.target.value})}>
                <option value="">-- Seleccione un equipo --</option>
                {equiposActivos.map((eq:any)=> (
                  <option key={eq.id} value={eq.id}>{`${eq.id} - ${eq.nombre}`}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input value={form.prioridad} onChange={(e)=>setForm({...form, prioridad: e.target.value})} />
              <Input value={form.estado} onChange={(e)=>setForm({...form, estado: e.target.value})} />
              <Input value={form.ordenes} onChange={(e)=>setForm({...form, ordenes: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Descripción</label>
              <Input value={form.descripcion} onChange={(e)=>setForm({...form, descripcion: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Área" value={form.area} onChange={(e)=>setForm({...form, area: e.target.value})} />
              <Input placeholder="Ciudad" value={form.ciudad} onChange={(e)=>setForm({...form, ciudad: e.target.value})} />
            </div>
              </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-white/80 backdrop-blur-md">
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={()=>{ setOpenAddEdit(false); setEditing(null); }}>Cancelar</Button>
              <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700">{editing ? 'Actualizar' : 'Registrar'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar solicitudes</AlertDialogTitle>
            <AlertDialogDescription>¿Eliminar {selectedRows.size} solicitud(es)? Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SolicitudesAbiertas;
