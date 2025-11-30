import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Trash2 } from "lucide-react";

interface OrdenServicio {
  id: number;
  numero: string;
  cronogramaId: number;
  equipo: string;
  estado: string; // Terminada
  tipo: string;
  responsable: string;
  prioridad: string;
  descripcion?: string;
  closedDate?: string;
}

const STORAGE_KEY = "gm_ordenes_v1";

export default function OrdenesTerminadas() {
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    try {
      const parsed = JSON.parse(raw);
      setOrdenes(parsed.filter((o: OrdenServicio) => o.estado === "Terminada"));
    } catch (e) {
      console.error(e);
      setOrdenes([]);
    }
  };

  const exportCsv = () => {
    const rows = ordenes.map((o) => ({ numero: o.numero, equipo: o.equipo, responsable: o.responsable, estado: o.estado }));
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordenes_terminadas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printOrder = (orden: OrdenServicio) => {
    const html = `
      <html>
      <head>
        <title>Orden ${orden.numero}</title>
      </head>
      <body>
        <h1>Orden ${orden.numero}</h1>
        <p><strong>Equipo:</strong> ${orden.equipo}</p>
        <p><strong>Responsable:</strong> ${orden.responsable}</p>
        <p><strong>Tipo:</strong> ${orden.tipo}</p>
        <p><strong>Prioridad:</strong> ${orden.prioridad}</p>
        <p><strong>Descripcion:</strong> ${orden.descripcion || ''}</p>
        <p><strong>Fecha cierre:</strong> ${orden.closedDate || ''}</p>
      </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  const onDelete = (orden: OrdenServicio) => {
    if (!confirm("¿Eliminar orden terminada?")) return;
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = raw.filter((o: OrdenServicio) => o.id !== orden.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    load();
  };

  const filtered = ordenes.filter((o) => {
    const q = filter.toLowerCase();
    return (
      o.numero.toLowerCase().includes(q) ||
      o.equipo.toLowerCase().includes(q) ||
      (o.responsable || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes terminadas</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button variant="outline" onClick={exportCsv}><Download /></Button>
        </div>
      </div>

      <div className="border rounded bg-card p-4">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha cierre</TableHead>
              <TableHead className="w-36">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay órdenes terminadas</TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/30">
                  <TableCell>{o.numero}</TableCell>
                  <TableCell><Badge>{o.prioridad}</Badge></TableCell>
                  <TableCell className="font-medium">{o.equipo}</TableCell>
                  <TableCell>{o.descripcion || '-'}</TableCell>
                  <TableCell>{o.responsable}</TableCell>
                  <TableCell>{o.closedDate || '-'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => printOrder(o)}><Printer /></Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(o)}><Trash2 /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
