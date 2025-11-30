import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Sede {
  id: number;
  sede: string;
  entidadId?: number;
  entidadNombre?: string;
  regional?: string;
  ciudad?: string;
  pais?: string;
  direccion?: string;
  telefono?: string;
  areaM2?: string;
  estado?: string;
}

const STORAGE_KEY = "gm_sedes_v1";
const ENT_KEY = "gm_entidades_v1";

export default function Sedes() {
  const [items, setItems] = useState<Sede[]>([]);
  const [entidades, setEntidades] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sede | null>(null);
  const [form, setForm] = useState<Sede>({ id: 0, sede: "", entidadId: undefined, entidadNombre: "", regional: "", ciudad: "", pais: '', direccion: '', telefono: '', areaM2: '', estado: "Activo" });

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) try{ setItems(JSON.parse(raw)); }catch(e){ setItems([]); }
    const ent = localStorage.getItem(ENT_KEY);
    if(ent) try{ setEntidades(JSON.parse(ent)); }catch(e){ setEntidades([]); }
  }, []);

  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  useEffect(() => {
    const handler = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) try { setItems(JSON.parse(raw)); } catch (e) {}
    };
    window.addEventListener('gm:sedes:updated', handler);
    return () => window.removeEventListener('gm:sedes:updated', handler);
  }, []);

  const filtered = useMemo(()=> items.filter(i => i.estado !== 'Inactivo' && (i.sede.toLowerCase().includes(search.toLowerCase()) || (i.entidadNombre||'').toLowerCase().includes(search.toLowerCase()))), [items, search]);

  const openAdd = ()=>{ setEditing(null); setForm({ id:0, sede:'', entidadId: undefined, entidadNombre:'', regional:'', ciudad:'', pais:'', direccion:'', telefono:'', areaM2:'', estado:'Activo' }); setOpen(true); };
  const openEdit = (row:Sede)=>{ setEditing(row); setForm(row); setOpen(true); };

  const save = ()=>{
    if(!form.sede){ toast({ title:'Validación', description:'El nombre de la sede es requerido', variant:'destructive' }); return; }
    if(!form.direccion){ toast({ title:'Validación', description:'La dirección es requerida', variant:'destructive' }); return; }
    if(form.entidadId && !form.entidadNombre){ const ent = entidades.find(e=>e.id===form.entidadId); if(ent) form.entidadNombre = ent.nombre; }
    if(editing){ setItems(prev=> prev.map(p=> p.id===editing.id ? {...p, ...form} : p)); toast({ title:'Actualizado' }); }
    else{ const id = Math.max(0, ...items.map(i=>i.id))+1; setItems(prev=> [{...form, id}, ...prev]); toast({ title:'Creado' }); }
    setOpen(false);
    window.dispatchEvent(new Event('gm:sedes:updated'));
  };

  const removeSelected = (ids:number[])=>{ if(ids.length===0){ toast({ title:'Seleccione', description:'Selecciona al menos una sede', variant:'destructive' }); return; } if(!confirm(`Eliminar ${ids.length} sede(s)?`)) return; setItems(prev=> prev.filter(i=> !ids.includes(i.id))); toast({ title:'Eliminado' }); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sedes: {filtered.length} / {items.length}</h1>
          <p className="text-sm text-muted-foreground">Sedes asociadas a entidades</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar sede o entidad" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-64" />
          <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700">Agregar</Button>
        </div>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Id</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Regional</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length===0 ? (<TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No rows</TableCell></TableRow>) : filtered.map(r=> (
                <TableRow key={r.id} className="border-b">
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.sede}</TableCell>
                  <TableCell>{r.entidadNombre}</TableCell>
                  <TableCell>{r.regional}</TableCell>
                  <TableCell>{r.ciudad}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={()=>openEdit(r)}>Editar</Button>
                      <Button size="sm" onClick={()=>{ if(!confirm('Inactivar sede?')) return; const updated = items.map(p=>p.id===r.id ? {...p, estado:'Inactivo'} : p); setItems(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); window.dispatchEvent(new Event('gm:sedes:updated')); toast({ title:'Inactivada' }); }}>Inactivar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Sede' : 'Crear Sede'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-2">
            <div>
              <label className="text-sm">Entidad</label>
              <Select value={(form.entidadId||'').toString()} onValueChange={(v)=>{ const id = Number(v)||undefined; const ent = entidades.find(e=>e.id===id); setForm(f=>({...f, entidadId: id, entidadNombre: ent? ent.nombre:''})); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">--</SelectItem>
                  {entidades.map(e=> (<SelectItem key={e.id} value={e.id.toString()}>{e.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Nombre de la Sede *</label>
              <Input value={form.sede||''} onChange={(e)=>setForm(f=>({...f, sede: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm">Dirección *</label>
              <textarea className="input w-full h-24 p-2" value={form.direccion||''} onChange={(e)=>setForm(f=>({...f, direccion: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Regional</label>
                <Input value={form.regional||''} onChange={(e)=>setForm(f=>({...f, regional: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Ciudad</label>
                <Input value={form.ciudad||''} onChange={(e)=>setForm(f=>({...f, ciudad: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">País</label>
                <select className="input w-full" value={form.pais||''} onChange={(e)=>setForm(f=>({...f, pais: e.target.value}))}>
                  <option value="">--</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Afganistán">Afganistán</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Teléfono</label>
                <Input value={form.telefono||''} onChange={(e)=>setForm(f=>({...f, telefono: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="text-sm">Área en metros cuadrados</label>
              <Input type="number" value={form.areaM2||''} onChange={(e)=>setForm(f=>({...f, areaM2: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm">Estado</label>
              <select className="input" value={form.estado||'Activo'} onChange={(e)=>setForm(f=>({...f, estado: e.target.value}))}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)} className="border-orange-400 text-orange-600 hover:bg-orange-50">Cancelar</Button>
            <Button onClick={save} className="bg-purple-600 hover:bg-purple-700">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
