import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Search, Info, Filter, RefreshCw, Plus, Edit, X, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Proveedor {
  id: number;
  numero: string;
  nit: string;
  estado: string;
  nombre: string;
  tipoServicio?: string;
}

const STORAGE_KEY = "gm_proveedores_v1";

const sample: Proveedor[] = [
  { id: 1, numero: "1670", nit: "860.002.134", estado: "ACTIVO", nombre: "Abbott", tipoServicio: "Equipos Biomédicos" },
  { id: 2, numero: "1675", nit: "900.514.524-9", estado: "ACTIVO", nombre: "Abbvie s.a.s", tipoServicio: "Equipos Biomédicos" },
  { id: 3, numero: "2632", nit: "8300104845", estado: "ACTIVO", nombre: "Aldir", tipoServicio: "Equipos Biomédicos" },
];

export default function Proveedores() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Proveedor[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [form, setForm] = useState({ numero: "", nit: "", estado: "ACTIVO", nombre: "", tipoServicio: "" });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setData(JSON.parse(raw));
        return;
      } catch (e) {
        // fallthrough
      }
    }
    setData(sample);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((p) =>
      p.numero.toLowerCase().includes(search.toLowerCase()) ||
      p.nit.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.tipoServicio || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const openAdd = () => {
    setEditing(null);
    setForm({ numero: "", nit: "", estado: "ACTIVO", nombre: "", tipoServicio: "" });
    setOpenDialog(true);
  };

  const openEdit = (p: Proveedor) => {
    setEditing(p);
    setForm({ numero: p.numero, nit: p.nit, estado: p.estado, nombre: p.nombre, tipoServicio: p.tipoServicio || "" });
    setOpenDialog(true);
  };

  const save = () => {
    if (!form.numero || !form.nombre) {
      toast({ title: "Error", description: "Número y nombre son requeridos", variant: "destructive" });
      return;
    }
    if (editing) {
      setData((prev) => prev.map((it) => (it.id === editing.id ? { ...it, ...form } : it)));
      toast({ title: "Actualizado", description: "Proveedor actualizado" });
    } else {
      const id = Math.max(0, ...data.map((d) => d.id)) + 1;
      setData((prev) => [{ id, ...form }, ...prev]);
      toast({ title: "Creado", description: "Proveedor agregado" });
    }
    setOpenDialog(false);
  };

  const confirmDelete = () => {
    if (selected.size === 0) {
      toast({ title: "Seleccione", description: "Selecciona al menos un proveedor", variant: "destructive" });
      return;
    }
    if (!confirm(`¿Eliminar ${selected.size} proveedor(es)?`)) return;
    setData((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
    toast({ title: "Eliminado", description: "Proveedor(es) eliminados" });
  };

  const exportCSV = () => {
    const rows = data;
    const csv = ["Número,NIT,Estado,Nombre,Tipo" , ...rows.map(r => `${r.numero},${r.nit},${r.estado},"${r.nombre}","${r.tipoServicio||''}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'proveedores.csv'; a.click(); URL.revokeObjectURL(url);
    toast({ title: 'Exportado', description: `${rows.length} filas` });
  };

  const refresh = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setData(JSON.parse(raw));
    toast({ title: 'Refrescado', description: 'Datos recargados' });
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(f => f.id)));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proveedores : {data.length} / {data.length}</h1>
          <p className="text-muted-foreground">Lista y gestión de proveedores</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-64" />
          <Button size="sm" variant="outline" onClick={()=>toast({title:'Info', description:'Ayuda del módulo'})}><Info size={16} /></Button>
          <Button size="sm" variant="outline" onClick={()=>{ /* filter placeholder */ }}><Filter size={16} /></Button>
          <Button size="sm" variant="outline" onClick={refresh}><RefreshCw size={16} /></Button>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download size={16} /></Button>
          <Button size="sm" onClick={openAdd} className="bg-green-600 hover:bg-green-700"><Plus size={16} /></Button>
          <Button size="sm" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700"><X size={16} /></Button>
        </div>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-12"><input type="checkbox" className="w-4 h-4" checked={selected.size===filtered.length && filtered.length>0} onChange={selectAll} /></TableHead>
                <TableHead>Número</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo de servicio</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length===0 ? (
                <TableRow><TableCell colSpan={7} className="py-20 text-center text-muted-foreground">No Rows To Show</TableCell></TableRow>
              ) : (
                filtered.map((p)=> (
                  <TableRow key={p.id} className="border-b hover:bg-muted/10">
                    <TableCell><input type="checkbox" className="w-4 h-4" checked={selected.has(p.id)} onChange={()=>toggleSelect(p.id)} /></TableCell>
                    <TableCell className="font-mono">{p.numero}</TableCell>
                    <TableCell>{p.nit}</TableCell>
                    <TableCell>{p.estado}</TableCell>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-sm">{p.tipoServicio}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="ghost" onClick={()=>openEdit(p)} title="Editar"><Edit size={16} /></Button>
                        <Button size="sm" variant="ghost" onClick={()=>{ setSelected(new Set([p.id])); confirmDelete(); }} title="Eliminar"><Trash2 size={16} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar proveedor' : 'Agregar proveedor'}</DialogTitle>
            <DialogDescription>Ingresa los datos del proveedor</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Número</label>
                <Input value={form.numero} onChange={(e)=>setForm(prev=>({...prev, numero: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm mb-1">NIT</label>
                <Input value={form.nit} onChange={(e)=>setForm(prev=>({...prev, nit: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <Input value={form.nombre} onChange={(e)=>setForm(prev=>({...prev, nombre: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Tipo de servicio</label>
                <Input value={form.tipoServicio} onChange={(e)=>setForm(prev=>({...prev, tipoServicio: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Estado</label>
                <select className="input" value={form.estado} onChange={(e)=>setForm(prev=>({...prev, estado: e.target.value}))}>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">{editing ? 'Guardar cambios' : 'Agregar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
