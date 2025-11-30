import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Entidad {
  id: number;
  nombre: string;
  nit: string;
  tipo: string;
  estado: string;
  email: string;
}

const STORAGE_KEY = "gm_entidades_v1";

export default function EntidadesInactivas() {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setEntidades(JSON.parse(raw)); } catch (e) { setEntidades([]); }
    }
  }, []);

  // Listen for updates from other pages/components and reload storage
  useEffect(() => {
    const handler = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try { setEntidades(JSON.parse(raw)); } catch (e) { setEntidades([]); }
      } else {
        setEntidades([]);
      }
    };
    window.addEventListener('gm:entidades:updated', handler);
    return () => window.removeEventListener('gm:entidades:updated', handler);
  }, []);

  const inactivos = useMemo(() => {
    return entidades.filter(e => e.estado === 'Inactivo' && (e.nombre.toLowerCase().includes(search.toLowerCase()) || e.nit.includes(search)));
  }, [entidades, search]);

  const reactivate = (id: number) => {
    const updated = entidades.map(e => e.id === id ? { ...e, estado: 'Activo' } : e);
    setEntidades(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast({ title: 'Reactivado', description: 'Entidad reactivada' });
    // notify other pages to reload entidades
    window.dispatchEvent(new Event('gm:entidades:updated'));
  };

  const getStateBadge = (estado: string) => estado === 'Activo' ? <Badge className="bg-green-100 text-green-800">Activo</Badge> : <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entidades inactivas: {inactivos.length}</h1>
          <p className="text-sm text-muted-foreground">Lista de entidades marcadas como Inactivo</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar nombre o NIT" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-64" />
        </div>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Id</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactivos.length===0 ? (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No hay entidades inactivas</TableCell></TableRow>
              ) : inactivos.map(e => (
                <TableRow key={e.id} className="border-b">
                  <TableCell>{e.id}</TableCell>
                  <TableCell>{e.nombre}</TableCell>
                  <TableCell>{e.nit}</TableCell>
                  <TableCell>{e.tipo}</TableCell>
                  <TableCell>{getStateBadge(e.estado)}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={()=>reactivate(e.id)}>Reactivar</Button>
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
