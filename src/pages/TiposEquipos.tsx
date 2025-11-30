import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Grid3x3, Filter, RefreshCw, Plus, Pencil, X, Settings, Download, Save, CheckSquare, Image, FileText, Sliders, Archive, BookOpen, Users, ClipboardList, GitMerge, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TipoEquipo {
  id: number;
  clase?: string;
  nombre: string;
  alias?: string;
  marca?: string;
  modelo?: string;
  tipo?: string;
  cantidadEquipos?: number;
  equiposActivos?: number;
  frecuenciaMantenimientoMeses?: string;
  frecuenciaCalibracionMeses?: string;
  frecuenciaCambioAccesoriosMeses?: string;
  frecuenciaCalificacionesMeses?: string;
  frecuenciaValidacion?: string;
  frecuenciaVerificacion?: string;
  procesoProduccion?: boolean;
  llevaGas?: boolean;
  llevaAceite?: boolean;
  invima?: string;
  ecri?: string;
  registroSanitario?: string;
  vencimientoRegistro?: string;
  horasUsoPromedio?: { hh: number; mm: number };
  vidaUtilAnual?: string;
  fabricante?: string;
  valorSalvamento?: string;
  tasaRetorno?: string;
  frecuenciaControlCalidad?: string;
  clasificacionBiomedica?: string;
  codigoReferencia?: string;
  seguridadElectricaClase?: string;
  seguridadElectricaTipo?: string;
}

const STORAGE_KEY = "gm_tipos_equipos_v1";

const seed: TipoEquipo[] = [
  { id: 1, nombre: "ABPI MD", marca: "MESI", modelo: "ABPIMDD", cantidadEquipos: 2, equiposActivos: 2 },
  { id: 2, nombre: "Agitador / incubador", marca: "Awareness", modelo: "Stat Fax - 2200", cantidadEquipos: 1, equiposActivos: 0 },
];

export default function TiposEquipos() {
  const { toast } = useToast();
  const [items, setItems] = useState<TipoEquipo[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNombre, setFilterNombre] = useState("");
  const [filterMarca, setFilterMarca] = useState("");
  const [filterModelo, setFilterModelo] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<TipoEquipo | null>(null);
  const [form, setForm] = useState<TipoEquipo>({ id: 0, nombre: "" });

  // Files store: images and documents per tipoEquipo
  const FILES_KEY = "gm_tipos_equipos_files_v1";
  const [filesStore, setFilesStore] = useState<Record<number, { images: Array<any>; docs: Array<any>; parametros: Array<any>; accesorios: Array<any>; instructivos: Array<any> }>>({});
  const [openImagesModal, setOpenImagesModal] = useState(false);
  const [openDocsModal, setOpenDocsModal] = useState(false);
  const [currentTipoId, setCurrentTipoId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILES_KEY);
      if (raw) setFilesStore(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FILES_KEY, JSON.stringify(filesStore)); } catch (e) { /* ignore */ }
  }, [filesStore]);

  const readFileAsDataUrl = (file: File) => new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

  const openImages = (id: number) => { setCurrentTipoId(id); setOpenImagesModal(true); };
  const openDocs = (id: number) => { setCurrentTipoId(id); setOpenDocsModal(true); };

  // Parameters / Accessories / Instructivos handlers
  const openParameters = (id: number) => { setCurrentTipoId(id); setOpenParametersModal(true); };
  const openAccessories = (id: number) => { setCurrentTipoId(id); setOpenAccessoriesModal(true); };
  const openInstructivos = (id: number) => { setCurrentTipoId(id); setOpenInstructivosModal(true); };

  const [openParametersModal, setOpenParametersModal] = useState(false);
  const [openAccessoriesModal, setOpenAccessoriesModal] = useState(false);
  const [openInstructivosModal, setOpenInstructivosModal] = useState(false);

  // parameter form state
  const [paramName, setParamName] = useState("");
  const [paramValue, setParamValue] = useState("");
  const [editingParamId, setEditingParamId] = useState<number | null>(null);

  // accessory form state
  const [accName, setAccName] = useState("");
  const [accDesc, setAccDesc] = useState("");
  const [editingAccId, setEditingAccId] = useState<number | null>(null);

  // instructivo form state
  const [insName, setInsName] = useState("");
  const [insContent, setInsContent] = useState("");
  const [editingInsId, setEditingInsId] = useState<number | null>(null);
  const [selectedInstructivos, setSelectedInstructivos] = useState<number[]>([]);

  const toggleSelectInstructivo = (id:number) => {
    setSelectedInstructivos(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const toggleSelectAllInstructivos = (list:any[]) => {
    if (selectedInstructivos.length === (list?.length || 0)) setSelectedInstructivos([]);
    else setSelectedInstructivos((list||[]).map((x:any)=>x.id));
  };

  const ensureEntry = (id: number) => {
    setFilesStore(prev => ({ ...prev, [id]: { images: prev[id]?.images || [], docs: prev[id]?.docs || [], parametros: prev[id]?.parametros || [], accesorios: prev[id]?.accesorios || [], instructivos: prev[id]?.instructivos || [] } }));
  };

  const addParametro = (tipoId: number) => {
    if (!paramName) { toast({ title: 'Validación', description: 'Nombre requerido', variant: 'destructive' }); return; }
    const item = { id: Date.now(), nombre: paramName, valor: paramValue };
    ensureEntry(tipoId);
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], parametros: [...(prev[tipoId]?.parametros || []), item] } }));
    setParamName(''); setParamValue('');
    toast({ title: 'Parámetro agregado' });
  };

  const editParametro = (tipoId:number, paramId:number) => {
    const list = filesStore[tipoId]?.parametros || [];
    const p = list.find((x:any)=>x.id===paramId);
    if (!p) return;
    setParamName(p.nombre); setParamValue(p.valor||''); setEditingParamId(paramId);
  };

  const saveEditParametro = (tipoId:number) => {
    if (!editingParamId) return;
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], parametros: (prev[tipoId].parametros || []).map((p:any)=> p.id===editingParamId ? { ...p, nombre: paramName, valor: paramValue } : p) } }));
    setEditingParamId(null); setParamName(''); setParamValue('');
    toast({ title: 'Parámetro actualizado' });
  };

  const deleteParametro = (tipoId:number, paramId:number) => {
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], parametros: (prev[tipoId].parametros || []).filter((p:any)=>p.id!==paramId) } }));
    toast({ title: 'Eliminado', description: 'Parámetro eliminado' });
  };

  const addAccesorio = (tipoId:number) => {
    if (!accName) { toast({ title: 'Validación', description: 'Nombre requerido', variant: 'destructive' }); return; }
    const item = { id: Date.now(), nombre: accName, descripcion: accDesc };
    ensureEntry(tipoId);
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], accesorios: [...(prev[tipoId]?.accesorios || []), item] } }));
    setAccName(''); setAccDesc('');
    toast({ title: 'Accesorio agregado' });
  };

  const editAccesorio = (tipoId:number, accId:number) => {
    const a = filesStore[tipoId]?.accesorios?.find((x:any)=>x.id===accId);
    if (!a) return; setAccName(a.nombre); setAccDesc(a.descripcion||''); setEditingAccId(accId);
  };

  const saveEditAccesorio = (tipoId:number) => {
    if (!editingAccId) return;
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], accesorios: (prev[tipoId].accesorios||[]).map((a:any)=> a.id===editingAccId ? { ...a, nombre: accName, descripcion: accDesc } : a) } }));
    setEditingAccId(null); setAccName(''); setAccDesc('');
    toast({ title: 'Accesorio actualizado' });
  };

  const deleteAccesorio = (tipoId:number, accId:number) => {
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], accesorios: (prev[tipoId].accesorios||[]).filter((a:any)=>a.id!==accId) } }));
    toast({ title: 'Eliminado', description: 'Accesorio eliminado' });
  };

  const addInstructivo = (tipoId:number) => {
    if (!insName) { toast({ title: 'Validación', description: 'Nombre requerido', variant: 'destructive' }); return; }
    const item = { id: Date.now(), nombre: insName, contenido: insContent };
    ensureEntry(tipoId);
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], instructivos: [...(prev[tipoId]?.instructivos || []), item] } }));
    setInsName(''); setInsContent('');
    toast({ title: 'Instructivo agregado' });
  };

  const editInstructivo = (tipoId:number, insId:number) => {
    const i = filesStore[tipoId]?.instructivos?.find((x:any)=>x.id===insId);
    if (!i) return; setInsName(i.nombre); setInsContent(i.contenido||''); setEditingInsId(insId);
  };

  const saveEditInstructivo = (tipoId:number) => {
    if (!editingInsId) return;
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], instructivos: (prev[tipoId].instructivos||[]).map((it:any)=> it.id===editingInsId ? { ...it, nombre: insName, contenido: insContent } : it) } }));
    setEditingInsId(null); setInsName(''); setInsContent('');
    toast({ title: 'Instructivo actualizado' });
  };

  const deleteInstructivo = (tipoId:number, insId:number) => {
    setFilesStore(prev => ({ ...prev, [tipoId]: { ...prev[tipoId], instructivos: (prev[tipoId].instructivos||[]).filter((it:any)=>it.id!==insId) } }));
    toast({ title: 'Eliminado', description: 'Instructivo eliminado' });
  };

  const handleAddFiles = async (files: FileList | null, kind: "images" | "docs") => {
    if (!files || !currentTipoId) return;
    const arr = Array.from(files);
    const read = await Promise.all(arr.map(async (f) => ({ id: Date.now() + Math.random(), name: f.name, type: f.type, data: await readFileAsDataUrl(f) })));
    setFilesStore(prev => ({ ...prev, [currentTipoId]: { images: (prev[currentTipoId]?.images || []), docs: (prev[currentTipoId]?.docs || [] ) } }));
    setFilesStore(prev => {
      const existing = prev[currentTipoId] || { images: [], docs: [] };
      const next = { ...prev, [currentTipoId]: { ...existing, [kind]: [...(existing as any)[kind], ...read] } };
      return next;
    });
    toast({ title: 'Archivos subidos', description: `${read.length} archivo(s) agregados` });
  };

  const handleDeleteFile = (tipoId: number, kind: 'images' | 'docs', fileId: number) => {
    setFilesStore(prev => {
      const existing = prev[tipoId] || { images: [], docs: [] };
      const updated = { ...existing, [kind]: (existing as any)[kind].filter((f:any)=>f.id !== fileId) };
      return { ...prev, [tipoId]: updated };
    });
    toast({ title: 'Eliminado', description: 'Archivo eliminado' });
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
        return;
      } catch (e) {
        // ignore
      }
    }
    setItems(seed);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        item.nombre.toLowerCase().includes(s) ||
        (item.marca || "").toLowerCase().includes(s) ||
        (item.modelo || "").toLowerCase().includes(s);

      const matchesNombre = item.nombre.toLowerCase().includes(filterNombre.toLowerCase());
      const matchesMarca = (item.marca || "").toLowerCase().includes(filterMarca.toLowerCase());
      const matchesModelo = (item.modelo || "").toLowerCase().includes(filterModelo.toLowerCase());
      return matchesSearch && matchesNombre && matchesMarca && matchesModelo;
    });
  }, [items, searchTerm, filterNombre, filterMarca, filterModelo]);

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedRows((prev) => (prev.length === items.length ? [] : items.map((i) => i.id)));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ id: 0, nombre: "", cantidadEquipos: 0, equiposActivos: 0, horasUsoPromedio: { hh: 0, mm: 0 } });
    setOpenDialog(true);
  };

  const openEdit = () => {
    if (selectedRows.length !== 1) {
      toast({ title: "Seleccionar", description: "Selecciona exactamente un registro para editar", variant: "destructive" });
      return;
    }
    const id = selectedRows[0];
    const it = items.find((i) => i.id === id)!;
    setEditing(it);
    setForm({ ...it });
    setOpenDialog(true);
  };

  const save = () => {
    if (!form.nombre || form.nombre.trim() === "") {
      toast({ title: "Validación", description: "El campo 'Nombre' es requerido", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)));
      toast({ title: "Actualizado", description: "Tipo de equipo actualizado" });
    } else {
      const id = Math.max(0, ...items.map((i) => i.id)) + 1;
      setItems((prev) => [{ ...form, id }, ...prev]);
      toast({ title: "Creado", description: "Tipo de equipo agregado" });
    }
    setOpenDialog(false);
    setSelectedRows([]);
  };

  const confirmDelete = () => {
    if (selectedRows.length === 0) {
      toast({ title: "Seleccionar", description: "Selecciona al menos un registro para eliminar", variant: "destructive" });
      return;
    }
    if (!confirm(`¿Eliminar ${selectedRows.length} registro(s)?`)) return;
    setItems((prev) => prev.filter((p) => !selectedRows.includes(p.id)));
    setSelectedRows([]);
    toast({ title: "Eliminado", description: "Registro(s) eliminado(s)" });
  };

  const exportCSV = () => {
    const rows = items;
    const csv = ["id,nombre,marca,modelo,cantidad,equiposActivos", ...rows.map(r => `${r.id},"${r.nombre}","${r.marca||''}","${r.modelo||''}",${r.cantidadEquipos||0},${r.equiposActivos||0}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'tipos_equipos.csv'; a.click(); URL.revokeObjectURL(url);
    toast({ title: 'Exportado', description: `${rows.length} filas` });
  };

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-primary">Tipos de equipos : {filteredData.length} / {items.length}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Input placeholder="Buscar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
          <Button variant="outline" size="icon"><Settings className="h-4 w-4 text-primary" /></Button>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4 text-primary" /></Button>
          <Button variant="outline" size="icon" onClick={()=>{ const raw = localStorage.getItem(STORAGE_KEY); if(raw) setItems(JSON.parse(raw)); toast({ title: 'Refrescado' }); }}><RefreshCw className="h-4 w-4 text-primary" /></Button>
          <Button variant="outline" size="icon" onClick={openAdd}><Plus className="h-4 w-4 text-success" /></Button>
          <Button variant="outline" size="icon" onClick={openEdit}><Pencil className="h-4 w-4 text-warning" /></Button>
          <Button variant="outline" size="icon" onClick={confirmDelete}><X className="h-4 w-4 text-destructive" /></Button>
          <Button variant="outline" size="icon" onClick={exportCSV}><Download className="h-4 w-4 text-primary" /></Button>
          <Button variant="outline" size="icon"><Save className="h-4 w-4 text-success" /></Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-sidebar" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full min-w-[1600px] table-auto whitespace-nowrap">
            <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left w-12"><Checkbox checked={selectedRows.length===items.length && items.length>0} onCheckedChange={toggleAll} /></th>
                  <th className="px-4 py-3">Id</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3 text-center">Cantidad</th>
                  <th className="px-4 py-3 text-center">N° activos</th>
                  <th className="px-4 py-3">Evaluación</th>
                  <th className="px-2 py-3 text-center">Verif.</th>
                  <th className="px-2 py-3 text-center">Imágenes</th>
                  <th className="px-2 py-3 text-center">Docs</th>
                  <th className="px-2 py-3 text-center">Paráms</th>
                  <th className="px-2 py-3 text-center">Accesorios</th>
                  <th className="px-2 py-3 text-center">Instructivos</th>
                  <th className="px-2 py-3 text-center">Capac.</th>
                  <th className="px-2 py-3 text-center">Plantillas</th>
                  <th className="px-2 py-3 text-center">Fusionar</th>
                  <th className="px-2 py-3 text-center">Magnit.</th>
                </tr>
              <tr className="border-b border-border bg-muted/30">
                <th></th>
                <th></th>
                <th className="px-4 py-2"><Input value={filterNombre} onChange={(e)=>setFilterNombre(e.target.value)} className="h-7 text-xs"/></th>
                <th className="px-4 py-2"><Input value={filterMarca} onChange={(e)=>setFilterMarca(e.target.value)} className="h-7 text-xs"/></th>
                <th className="px-4 py-2"><Input value={filterModelo} onChange={(e)=>setFilterModelo(e.target.value)} className="h-7 text-xs"/></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length===0 ? (
                <tr><td colSpan={18} className="py-12 text-center text-muted-foreground">No Rows To Show</td></tr>
              ) : (
                filteredData.map((row, idx)=> (
                  <tr key={row.id} className={`border-b border-border hover:bg-muted/50 ${idx===filteredData.length-1? 'border-b-0':''}`}>
                    <td className="px-4 py-3"><Checkbox checked={selectedRows.includes(row.id)} onCheckedChange={()=>toggleRow(row.id)} /></td>
                    <td className="px-4 py-3 text-sm">{row.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{row.nombre}</td>
                    <td className="px-4 py-3 text-sm">{row.marca}</td>
                    <td className="px-4 py-3 text-sm">{row.modelo}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.cantidadEquipos||0}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.equiposActivos||0}</td>
                    <td className="px-4 py-3 text-sm">{row.clase||''}</td>
                    <td className="px-2 py-3 text-center">
                      <Button size="sm" variant="ghost" title="Verificación de documentos"><CheckSquare className="h-4 w-4" /></Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="icon" variant="ghost" onClick={()=>openImages(row.id)} className="h-8 w-8 p-1 rounded-md border border-orange-200 bg-white text-orange-500 hover:bg-orange-50" title="Imágenes">
                        <div className="flex items-center justify-center h-5 w-5"><Image className="h-4 w-4" /></div>
                      </Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="icon" variant="ghost" onClick={()=>openDocs(row.id)} className="h-8 w-8 p-1 rounded-md border border-sky-200 bg-white text-sky-600 hover:bg-sky-50" title="Documentos">
                        <div className="flex items-center justify-center h-5 w-5"><FileText className="h-4 w-4" /></div>
                      </Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="icon" variant="ghost" onClick={()=>openParameters(row.id)} className="h-8 w-8 p-1 rounded-md border border-violet-200 bg-white text-violet-600 hover:bg-violet-50" title="Parámetros">
                        <div className="flex items-center justify-center h-5 w-5"><Sliders className="h-4 w-4" /></div>
                      </Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="icon" variant="ghost" onClick={()=>openAccessories(row.id)} className="h-8 w-8 p-1 rounded-md border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50" title="Accesorios">
                        <div className="flex items-center justify-center h-5 w-5"><Archive className="h-4 w-4" /></div>
                      </Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="icon" variant="ghost" onClick={()=>openInstructivos(row.id)} className="h-8 w-8 p-1 rounded-md border border-amber-200 bg-white text-amber-600 hover:bg-amber-50" title="Instructivos">
                        <div className="flex items-center justify-center h-5 w-5"><BookOpen className="h-4 w-4" /></div>
                      </Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="sm" variant="ghost" title="Capacitaciones"><Users className="h-4 w-4" /></Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="sm" variant="ghost" title="Plantillas"><ClipboardList className="h-4 w-4" /></Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="sm" variant="ghost" title="Fusionar tipo"><GitMerge className="h-4 w-4" /></Button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button size="sm" variant="ghost" title="Magnitudes"><BarChart3 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tipo de equipo' : 'Nuevo tipo de equipo'}</DialogTitle>
            <DialogDescription>Rellena la información general del tipo de equipo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Clase</label>
                <select className="input w-full" value={form.clase||''} onChange={(e)=>setForm(f=>({...f, clase: e.target.value}))}>
                  <option value="">--</option>
                  <option value="BIOMEDICO">BIOMEDICO</option>
                  <option value="INDUSTRIAL">INDUSTRIAL</option>
                  <option value="SISTEMAS">SISTEMAS</option>
                  <option value="MOBILIARIO MEDICO">MOBILIARIO MEDICO</option>
                  <option value="PATRON">PATRON</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Nombre *</label>
                <Input value={form.nombre||''} onChange={(e)=>setForm(f=>({...f, nombre: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Alias</label>
                <Input value={form.alias||''} onChange={(e)=>setForm(f=>({...f, alias: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Marca *</label>
                <Input value={form.marca||''} onChange={(e)=>setForm(f=>({...f, marca: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Modelo *</label>
                <Input value={form.modelo||''} onChange={(e)=>setForm(f=>({...f, modelo: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Tipo</label>
                <select className="input w-full" value={form.tipo||''} onChange={(e)=>setForm(f=>({...f, tipo: e.target.value}))}>
                  <option value="">--</option>
                  <option value="ELECTRICO">ELECTRICO</option>
                  <option value="ELECTRONICO">ELECTRONICO</option>
                  <option value="ELECTROMECANICO">ELECTROMECANICO</option>
                  <option value="ELECTRONEUMATICO">ELECTRONEUMATICO</option>
                  <option value="NEUMATICO">NEUMATICO</option>
                  <option value="HIDRAULICO">HIDRAULICO</option>
                  <option value="MECANICO">MECANICO</option>
                  <option value="OPTICO">OPTICO</option>
                  <option value="NO APLICA">NO APLICA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Frecuencia mantenimiento (meses)</label>
                <Input value={form.frecuenciaMantenimientoMeses||''} onChange={(e)=>setForm(f=>({...f, frecuenciaMantenimientoMeses: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Frecuencia calibración (meses)</label>
                <Input value={form.frecuenciaCalibracionMeses||''} onChange={(e)=>setForm(f=>({...f, frecuenciaCalibracionMeses: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Frecuencia cambio accesorios (meses)</label>
                <Input value={form.frecuenciaCambioAccesoriosMeses||''} onChange={(e)=>setForm(f=>({...f, frecuenciaCambioAccesoriosMeses: e.target.value}))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm">INVIMA clasificación</label>
                <select className="input w-full" value={form.invima||''} onChange={(e)=>setForm(f=>({...f, invima: e.target.value}))}>
                  <option value="">--</option>
                  <option value="I">I</option>
                  <option value="IIA">IIA</option>
                  <option value="IIB">IIB</option>
                  <option value="III">III</option>
                  <option value="sin clasificar">sin clasificar</option>
                  <option value="no aplica">no aplica</option>
                </select>
              </div>
              <div>
                <label className="text-sm">ECRI</label>
                <Input value={form.ecri||''} onChange={(e)=>setForm(f=>({...f, ecri: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Código de referencia</label>
                <Input value={form.codigoReferencia||''} onChange={(e)=>setForm(f=>({...f, codigoReferencia: e.target.value}))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Registro sanitario</label>
                <Input value={form.registroSanitario||''} onChange={(e)=>setForm(f=>({...f, registroSanitario: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Vencimiento registro sanitario</label>
                <Input type="date" value={form.vencimientoRegistro||''} onChange={(e)=>setForm(f=>({...f, vencimientoRegistro: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Horas de uso promedio mensual</label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={(form.horasUsoPromedio?.hh||0).toString()} onChange={(e)=>setForm(f=>({...f, horasUsoPromedio: { hh: Number(e.target.value)||0, mm: f.horasUsoPromedio?.mm||0 }}))} className="w-24" />
                  <span>:</span>
                  <Input type="number" value={(form.horasUsoPromedio?.mm||0).toString()} onChange={(e)=>setForm(f=>({...f, horasUsoPromedio: { hh: f.horasUsoPromedio?.hh||0, mm: Number(e.target.value)||0 }}))} className="w-24" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Vida útil (anual)</label>
                <Input value={form.vidaUtilAnual||''} onChange={(e)=>setForm(f=>({...f, vidaUtilAnual: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Fabricante</label>
                <Input value={form.fabricante||''} onChange={(e)=>setForm(f=>({...f, fabricante: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Valor salvamento (%)</label>
                <Input value={form.valorSalvamento||''} onChange={(e)=>setForm(f=>({...f, valorSalvamento: e.target.value}))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.procesoProduccion} onCheckedChange={(v)=>setForm(f=>({...f, procesoProduccion: !!v}))} />
                <span>Proceso de Producción</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.llevaGas} onCheckedChange={(v)=>setForm(f=>({...f, llevaGas: !!v}))} />
                <span>Lleva gas asociado</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.llevaAceite} onCheckedChange={(v)=>setForm(f=>({...f, llevaAceite: !!v}))} />
                <span>Lleva aceite asociado</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Frecuencia control de calidad</label>
                <Input value={form.frecuenciaControlCalidad||''} onChange={(e)=>setForm(f=>({...f, frecuenciaControlCalidad: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Clasificación biomédica</label>
                <select className="input w-full" value={form.clasificacionBiomedica||''} onChange={(e)=>setForm(f=>({...f, clasificacionBiomedica: e.target.value}))}>
                  <option value="">--</option>
                  <option value="Analisis de laboratorio">Analisis de laboratorio</option>
                  <option value="Diagnostico">Diagnostico</option>
                  <option value="Rehabilitacion">Rehabilitacion</option>
                  <option value="Tratamiento y mantenimiento de la vida">Tratamiento y mantenimiento de la vida</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Tipo de seguridad eléctrica - Clase</label>
                <select className="input w-full" value={form.seguridadElectricaClase||''} onChange={(e)=>setForm(f=>({...f, seguridadElectricaClase: e.target.value}))}>
                  <option value="">--</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="no aplica">no aplica</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Tipo de seguridad eléctrica - Tipo</label>
                <select className="input w-full" value={form.seguridadElectricaTipo||''} onChange={(e)=>setForm(f=>({...f, seguridadElectricaTipo: e.target.value}))}>
                  <option value="">--</option>
                  <option value="B">B</option>
                  <option value="BF">BF</option>
                  <option value="CF">CF</option>
                  <option value="H">H</option>
                  <option value="no aplica">no aplica</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">{editing ? 'Guardar cambios' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Parameters modal */}
        <Dialog open={openParametersModal} onOpenChange={(v)=>{ setOpenParametersModal(v); if(!v) setCurrentTipoId(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Parámetros</DialogTitle>
              <DialogDescription>Crear y listar parámetros para este tipo de equipo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Nombre" value={paramName} onChange={(e)=>setParamName(e.target.value)} />
                <Input placeholder="Valor" value={paramValue} onChange={(e)=>setParamValue(e.target.value)} />
                {editingParamId ? (
                  <Button onClick={()=>{ if(currentTipoId) saveEditParametro(currentTipoId); }} className="bg-yellow-500">Actualizar</Button>
                ) : (
                  <Button onClick={()=>{ if(currentTipoId) addParametro(currentTipoId); }} className="bg-green-600">Agregar</Button>
                )}
              </div>

              <div className="space-y-2">
                {(currentTipoId && filesStore[currentTipoId]?.parametros?.length ? filesStore[currentTipoId].parametros : []).map((p:any)=> (
                  <div key={p.id} className="flex items-center justify-between gap-3 border rounded-md p-2">
                    <div>
                      <div className="font-medium">{p.nombre}</div>
                      <div className="text-xs text-muted-foreground">{p.valor}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={()=>{ if(currentTipoId) editParametro(currentTipoId, p.id); }}>Editar</Button>
                      <Button size="sm" variant="ghost" onClick={()=>{ if(currentTipoId) deleteParametro(currentTipoId, p.id); }}>Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>{ setOpenParametersModal(false); setCurrentTipoId(null); setEditingParamId(null); setParamName(''); setParamValue(''); }}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Accessories modal */}
        <Dialog open={openAccessoriesModal} onOpenChange={(v)=>{ setOpenAccessoriesModal(v); if(!v) setCurrentTipoId(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Accesorios</DialogTitle>
              <DialogDescription>Crear, editar y eliminar accesorios del tipo de equipo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Nombre accesorio" value={accName} onChange={(e)=>setAccName(e.target.value)} />
                <Input placeholder="Descripción" value={accDesc} onChange={(e)=>setAccDesc(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {editingAccId ? (
                  <Button className="bg-yellow-500" onClick={()=>{ if(currentTipoId) saveEditAccesorio(currentTipoId); }}>Actualizar</Button>
                ) : (
                  <Button className="bg-green-600" onClick={()=>{ if(currentTipoId) addAccesorio(currentTipoId); }}>Agregar</Button>
                )}
              </div>
              <div className="space-y-2">
                {(currentTipoId && filesStore[currentTipoId]?.accesorios?.length ? filesStore[currentTipoId].accesorios : []).map((a:any)=> (
                  <div key={a.id} className="flex items-center justify-between gap-3 border rounded-md p-2">
                    <div>
                      <div className="font-medium">{a.nombre}</div>
                      <div className="text-xs text-muted-foreground">{a.descripcion}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={()=>{ if(currentTipoId) editAccesorio(currentTipoId, a.id); }}>Editar</Button>
                      <Button size="sm" variant="ghost" onClick={()=>{ if(currentTipoId) deleteAccesorio(currentTipoId, a.id); }}>Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>{ setOpenAccessoriesModal(false); setCurrentTipoId(null); setEditingAccId(null); setAccName(''); setAccDesc(''); }}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instructivos modal (styled like reference) */}
        <Dialog open={openInstructivosModal} onOpenChange={(v)=>{ setOpenInstructivosModal(v); if(!v) setCurrentTipoId(null); setSelectedInstructivos([]); }}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Instructivo</DialogTitle>
              <DialogDescription className="text-sm">Gestiona los pasos e instructivos asociados al tipo de equipo.</DialogDescription>
            </DialogHeader>

            {/* Header area: total, filter, toolbar */}
            <div className="border rounded-md p-4 mb-4 bg-muted/50 flex items-center justify-between gap-4">
              <div className="text-sm">Total de registros : { (currentTipoId && filesStore[currentTipoId]?.instructivos?.length) || 0 } / { (currentTipoId && filesStore[currentTipoId]?.instructivos?.length) || 0 }</div>
              <div className="flex-1 flex justify-center">
                <select className="input w-64">
                  <option value="TODOS">TODOS</option>
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-md border border-gray-200" title="Info"><CheckSquare className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-md border border-gray-200" onClick={()=>{ if (currentTipoId) { const raw = localStorage.getItem(FILES_KEY); if (raw) setFilesStore(JSON.parse(raw)); toast({ title: 'Refrescado' }); } }} title="Refrescar"><RefreshCw className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-md border border-gray-200 bg-green-50" onClick={()=>{ setEditingInsId(null); setInsName(''); setInsContent(''); }} title="Nuevo"><Plus className="h-4 w-4 text-green-600" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-md border border-gray-200" onClick={()=>{ if (selectedInstructivos.length===1 && currentTipoId) editInstructivo(currentTipoId, selectedInstructivos[0]); else toast({ title: 'Editar', description: 'Selecciona un solo instructivo', variant: 'destructive' }); }} title="Editar"><Pencil className="h-4 w-4 text-amber-600" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-md border border-gray-200" onClick={()=>{ if (!currentTipoId) return; selectedInstructivos.forEach(id=> deleteInstructivo(currentTipoId, id)); setSelectedInstructivos([]); }} title="Eliminar"><X className="h-4 w-4 text-red-600" /></Button>
              </div>
            </div>

            {/* New/edit form */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Tipo instructivo (nombre)" value={insName} onChange={(e)=>setInsName(e.target.value)} />
                <Input placeholder="Paso (resumen)" value={insContent} onChange={(e)=>setInsContent(e.target.value)} />
                <div className="flex items-center gap-2">
                  {editingInsId ? (
                    <Button className="bg-yellow-500" onClick={()=>{ if(currentTipoId) saveEditInstructivo(currentTipoId); }}>Actualizar</Button>
                  ) : (
                    <Button className="bg-green-600" onClick={()=>{ if(currentTipoId) addInstructivo(currentTipoId); }}>Agregar</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded border border-border overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-3 w-12"><input type="checkbox" className="w-4 h-4" checked={ currentTipoId ? (selectedInstructivos.length=== (filesStore[currentTipoId]?.instructivos?.length||0) && (filesStore[currentTipoId]?.instructivos?.length||0)>0) : false } onChange={()=> toggleSelectAllInstructivos(filesStore[currentTipoId]?.instructivos||[])} /></th>
                    <th className="p-3 text-left">Secuencia</th>
                    <th className="p-3 text-left">Tipo de instructivo</th>
                    <th className="p-3 text-left">Paso</th>
                    <th className="p-3 text-left">Tipo de paso</th>
                  </tr>
                </thead>
                <tbody>
                  { (currentTipoId && filesStore[currentTipoId]?.instructivos?.length ? filesStore[currentTipoId].instructivos : []).map((it:any, idx:number)=> (
                    <tr key={it.id} className="border-b border-border">
                      <td className="p-3 text-center"><input type="checkbox" className="w-4 h-4" checked={selectedInstructivos.includes(it.id)} onChange={()=>toggleSelectInstructivo(it.id)} /></td>
                      <td className="p-3">{idx+1}</td>
                      <td className="p-3 font-medium">{it.nombre}</td>
                      <td className="p-3 text-sm truncate max-w-[480px]">{it.contenido}</td>
                      <td className="p-3 text-sm">Pasa / No Pasa / No Aplica</td>
                    </tr>
                  )) }
                  { (currentTipoId && (filesStore[currentTipoId]?.instructivos?.length||0)) === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No hay instructivos</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <DialogFooter>
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-muted-foreground">Página 1</div>
                <div>
                  <Button variant="outline" onClick={()=>{ setOpenInstructivosModal(false); setCurrentTipoId(null); setEditingInsId(null); setInsName(''); setInsContent(''); }}>Cerrar</Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Images modal */}
      <Dialog open={openImagesModal} onOpenChange={(v)=>{ setOpenImagesModal(v); if(!v) setCurrentTipoId(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Imágenes</DialogTitle>
            <DialogDescription>Sube imágenes para el tipo de equipo seleccionado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input type="file" accept="image/*" multiple onChange={(e)=>handleAddFiles(e.target.files, 'images')} />
            <div className="grid grid-cols-4 gap-3 mt-2">
              {(currentTipoId && filesStore[currentTipoId]?.images?.length ? filesStore[currentTipoId].images : []).map((f:any)=> (
                <div key={f.id} className="border rounded-md p-2 text-center">
                  <img src={f.data} alt={f.name} className="h-24 w-full object-contain mb-2" />
                  <div className="flex items-center justify-between gap-2">
                    <a href={f.data} download={f.name} className="text-xs underline">Descargar</a>
                    <Button size="sm" variant="ghost" onClick={()=>handleDeleteFile(currentTipoId, 'images', f.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>{ setOpenImagesModal(false); setCurrentTipoId(null); }}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents modal */}
      <Dialog open={openDocsModal} onOpenChange={(v)=>{ setOpenDocsModal(v); if(!v) setCurrentTipoId(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Documentos</DialogTitle>
            <DialogDescription>Sube documentos y archivos relacionados con el tipo de equipo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*" multiple onChange={(e)=>handleAddFiles(e.target.files, 'docs')} />
            <div className="space-y-2 mt-2">
              {(currentTipoId && filesStore[currentTipoId]?.docs?.length ? filesStore[currentTipoId].docs : []).map((f:any)=> (
                <div key={f.id} className="flex items-center justify-between gap-3 border rounded-md p-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={f.data} download={f.name} className="text-sm underline">Descargar</a>
                    <Button size="sm" variant="ghost" onClick={()=>handleDeleteFile(currentTipoId, 'docs', f.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>{ setOpenDocsModal(false); setCurrentTipoId(null); }}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
