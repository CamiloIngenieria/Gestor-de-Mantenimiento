import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, Package, PlusSquare, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const columns = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Nombre" },
  { key: "categoria", label: "Categoría" },
  { key: "cantidad", label: "Cantidad" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "estado", label: "Estado" },
  { key: "acciones", label: "Acciones" },
];

const inventarioDataInit = [
  {
    codigo: "REP-001",
    nombre: "Filtro HEPA",
    categoria: "Repuestos",
    cantidad: "25",
    ubicacion: "Almacén Principal",
    estado: "Disponible",
  },
  {
    codigo: "REP-002",
    nombre: "Sensor de Temperatura",
    categoria: "Componentes",
    cantidad: "15",
    ubicacion: "Almacén Principal",
    estado: "Disponible",
  },
  {
    codigo: "REP-003",
    nombre: "Cable de Alimentación",
    categoria: "Accesorios",
    cantidad: "8",
    ubicacion: "Almacén Secundario",
    estado: "Stock Bajo",
  },
];

const Inventarios = () => {
  const STORAGE_KEY = "gm_inventarios_v1";

  const [items, setItems] = useState(
    inventarioDataInit.map((it, idx) => ({ id: idx + 1, ...it }))
  );
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ codigo: "", nombre: "", categoria: "", cantidad: "", ubicacion: "", estado: "Disponible" });

  const resetForm = () => setForm({ codigo: "", nombre: "", categoria: "", cantidad: "", ubicacion: "", estado: "Disponible" });

  const handleOpenAdd = () => {
    resetForm();
    setEditingId(null);
    setOpen(true);
  };

  const handleOpenEdit = (id: number) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    setForm({ codigo: it.codigo, nombre: it.nombre, categoria: it.categoria, cantidad: it.cantidad, ubicacion: it.ubicacion, estado: it.estado });
    setEditingId(id);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.nombre || !form.codigo) {
      toast({ title: "Datos incompletos", description: "Código y nombre son requeridos." });
      return;
    }
    if (editingId) {
      setItems((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...form } : p)));
      toast({ title: "Actualizado", description: "El repuesto se actualizó correctamente." });
    } else {
      const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
      setItems((prev) => [...prev, { id: nextId, ...form }]);
      toast({ title: "Agregado", description: "El repuesto se agregó correctamente." });
    }
    setOpen(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (!confirm(`Eliminar "${it.nombre}" (Código: ${it.codigo})?`)) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Eliminado", description: "El repuesto fue eliminado." });
  };

  // Persistencia en localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore storage errors
    }
  }, [items]);

  const data = items.map((row) => ({
    ...row,
    acciones: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(row.id)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDelete(row.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventarios</h1>
          <p className="text-muted-foreground">Control de repuestos y componentes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={handleOpenAdd}>
            <PlusSquare className="h-4 w-4" />
            Agregar Repuesto
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Inventario
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Total Items", value: "156", icon: Package, color: "text-primary" },
          { title: "Stock Bajo", value: "12", icon: Package, color: "text-warning" },
          { title: "Valor Total", value: "$45,230", icon: Package, color: "text-success" },
        ].map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DataTable columns={columns} data={data} actions={null} />

      {/* Dialog para agregar / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Repuesto" : "Agregar Repuesto"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modifica los datos del repuesto." : "Ingresa los datos del nuevo repuesto."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-4">
            <div>
              <label className="text-sm text-muted-foreground">Código</label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nombre</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Categoría</label>
              <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cantidad</label>
              <Input value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ubicación</label>
              <Input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Estado</label>
              <Input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingId ? "Guardar cambios" : "Agregar"}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventarios;
