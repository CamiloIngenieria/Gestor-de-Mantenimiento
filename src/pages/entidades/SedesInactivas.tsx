import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Sede {
  id: number;
  sede: string;
  entidadNombre?: string;
  regional?: string;
  ciudad?: string;
  estado?: string;
}

const STORAGE_KEY = "gm_sedes_v1";

export default function SedesInactivas(){
  const [items, setItems] = useState<Sede[]>([]);
  const [search, setSearch] = useState("");

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) try{ setItems(JSON.parse(raw)); }catch(e){ setItems([]); }
  },[]);

  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  useEffect(() => {
    const handler = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) try { setItems(JSON.parse(raw)); } catch (e) {}
    };
    window.addEventListener('gm:sedes:updated', handler);
    return () => window.removeEventListener('gm:sedes:updated', handler);
  }, []);

  const filtered = useMemo(()=> items.filter(i=> i.estado==='Inactivo' && (i.sede.toLowerCase().includes(search.toLowerCase()) || (i.entidadNombre||'').toLowerCase().includes(search.toLowerCase()))), [items, search]);

  const reactivate = (id:number)=>{ const updated = items.map(i=> i.id===id ? {...i, estado:'Activo'} : i); setItems(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); window.dispatchEvent(new Event('gm:sedes:updated')); toast({ title:'Reactivada', description:'Sede reactivada' }); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sedes inactivas: {filtered.length}</h1>
          <p className="text-sm text-muted-foreground">Lista de sedes marcadas como Inactivo</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar sede o entidad" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-64" />
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
              {filtered.length===0 ? (<TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No hay sedes inactivas</TableCell></TableRow>) : filtered.map(r=> (
                <TableRow key={r.id} className="border-b">
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.sede}</TableCell>
                  <TableCell>{r.entidadNombre}</TableCell>
                  <TableCell>{r.regional}</TableCell>
                  <TableCell>{r.ciudad}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={()=>reactivate(r.id)}>Reactivar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
