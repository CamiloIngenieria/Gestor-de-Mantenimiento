import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Copy, 
  Edit, 
  FileText, 
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Entidad {
  id: number;
  nombre: string;
  nit: string;
  tipo: string;
  estado: string;
  email: string;
  documentos?: Document[];
}

interface Document {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  contenido: string; // base64
  fecha: string;
}

const entidadesDataInit: Entidad[] = [
  {
    id: 1191,
    nombre: "Ambulancias SAI",
    nit: "9009668247",
    tipo: "Externo",
    estado: "Activo",
    email: "ambulanciassai@hotmail.com",
  },
  {
    id: 1190,
    nombre: "Ambulancias San Jose",
    nit: "9003823197",
    tipo: "Externo",
    estado: "Activo",
    email: "ambulanciassaniosepasto@hot...",
  },
  {
    id: 17992,
    nombre: "BBC Solutions SAS",
    nit: "901139486",
    tipo: "Externo",
    estado: "Activo",
    email: "dir.tecnica@bbcholding.co",
  },
  {
    id: 20146,
    nombre: "Binn SAS",
    nit: "901866515",
    tipo: "Interno",
    estado: "Activo",
    email: "binnsas@gmail.com",
  },
  {
    id: 9969,
    nombre: "Biofardix Suministros Medicos S.A.S",
    nit: "901.4138141",
    tipo: "Externo",
    estado: "Activo",
    email: "biofardix@gmail.com",
  },
  {
    id: 18266,
    nombre: "BREM SAS",
    nit: "301608985",
    tipo: "Externo",
    estado: "Activo",
    email: "bremsascomercial@gmail.com",
  },
  {
    id: 9834,
    nombre: "Carlos Julio Arellano",
    nit: "0000000000",
    tipo: "Externo",
    estado: "Activo",
    email: "carlosarellano@example.com",
  },
  {
    id: 14678,
    nombre: "Celery Group SAS",
    nit: "9012431776",
    tipo: "Externo",
    estado: "Activo",
    email: "celerygroupsas@example.com",
  },
];

const Entidades = () => {
  const STORAGE_KEY = "gm_entidades_v1";
  
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [selectedEntidadDocs, setSelectedEntidadDocs] = useState<Entidad | null>(null);
  const [editingEntidad, setEditingEntidad] = useState<Entidad | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    tipo: "Externo",
    estado: "Activo",
    email: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntidades(JSON.parse(stored));
      } catch (e) {
        setEntidades(entidadesDataInit);
      }
    } else {
      setEntidades(entidadesDataInit);
    }
  }, []);

  // Save to localStorage when entidades change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entidades));
  }, [entidades]);

  const filteredEntidades = useMemo(() => {
    return entidades.filter((e) =>
      e.estado === 'Activo' && (
        e.nombre.toLowerCase().includes(search.toLowerCase()) ||
        e.nit.includes(search) ||
        e.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, entidades]);

  const handleSelectRow = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredEntidades.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredEntidades.map((e) => e.id)));
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      nombre: "",
      nit: "",
      tipo: "Externo",
      estado: "Activo",
      email: "",
    });
    setEditingEntidad(null);
    setOpenAdd(true);
  };

  const handleOpenEdit = (entidad: Entidad) => {
    setFormData({
      nombre: entidad.nombre,
      nit: entidad.nit,
      tipo: entidad.tipo,
      estado: entidad.estado,
      email: entidad.email,
    });
    setEditingEntidad(entidad);
    setOpenEdit(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.nit || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Process uploaded files to base64
    const documentos: Document[] = [];
    for (const file of uploadedFiles) {
      const reader = new FileReader();
      const content = await new Promise<string>((resolve) => {
        reader.onload = (e) => {
          const content = (e.target?.result as string) || "";
          resolve(content);
        };
        reader.readAsDataURL(file);
      });

      documentos.push({
        id: Date.now().toString(),
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
        contenido: content,
        fecha: new Date().toLocaleDateString(),
      });
    }

    if (editingEntidad) {
      // Edit existing - preserve existing docs and add new ones
      const existingDocs = editingEntidad.documentos || [];
      setEntidades(
        entidades.map((e) =>
          e.id === editingEntidad.id
            ? { 
                ...e, 
                ...formData,
                documentos: [...existingDocs, ...documentos]
              }
            : e
        )
      );
      toast({
        title: "Actualizado",
        description: `${formData.nombre} ha sido actualizado correctamente`,
      });
      setOpenEdit(false);
    } else {
      // Add new
      const newId = Math.max(...entidades.map((e) => e.id), 0) + 1;
      const newEntidad: Entidad = {
        id: newId,
        ...formData,
        documentos: documentos,
      };
      setEntidades([...entidades, newEntidad]);
      toast({
        title: "Agregado",
        description: `${formData.nombre} ha sido agregado correctamente`,
      });
      setOpenAdd(false);
    }
    setUploadedFiles([]);
    // notify other pages that entidades changed
    window.dispatchEvent(new Event('gm:entidades:updated'));
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) {
      toast({
        title: "Seleccione",
        description: "Debe seleccionar al menos una entidad para eliminar",
        variant: "destructive",
      });
      return;
    }
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    // Mark selected entidades as Inactivo instead of removing
    const newEntidades = entidades.map((e) =>
      selectedRows.has(e.id) ? { ...e, estado: "Inactivo" } : e
    );
    setEntidades(newEntidades);
    setSelectedRows(new Set());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntidades));
    toast({
      title: "Inactivadas",
      description: `${newEntidades.filter(e=> e.estado==='Inactivo').length} entidades marcadas como Inactivo`,
    });
    setOpenDelete(false);
    // notify other pages to reload
    window.dispatchEvent(new Event('gm:entidades:updated'));
  };

  // Listen for external updates to entidades (from other tabs/components)
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { setEntidades(JSON.parse(stored)); } catch (e) {}
      }
    };
    window.addEventListener('gm:entidades:updated', handler);
    return () => window.removeEventListener('gm:entidades:updated', handler);
  }, []);

  const handleOpenDocuments = (entidad: Entidad) => {
    setSelectedEntidadDocs(entidad);
    setOpenDocuments(true);
  };

  const handleDownloadDocument = (doc: Document) => {
    const link = document.createElement("a");
    link.href = doc.contenido;
    link.download = doc.nombre;
    link.click();
    toast({
      title: "Descargando",
      description: `${doc.nombre} descargado correctamente`,
    });
  };

  const handleDeleteDocument = (docId: string) => {
    if (!selectedEntidadDocs) return;

    const updatedEntidades = entidades.map((e) =>
      e.id === selectedEntidadDocs.id
        ? {
            ...e,
            documentos: (e.documentos || []).filter((d) => d.id !== docId),
          }
        : e
    );

    setEntidades(updatedEntidades);
    setSelectedEntidadDocs({
      ...selectedEntidadDocs,
      documentos: selectedEntidadDocs.documentos?.filter((d) => d.id !== docId),
    });

    toast({
      title: "Eliminado",
      description: "Documento eliminado correctamente",
    });
  };

  const handleCopyNIT = (nit: string, nombre: string) => {
    navigator.clipboard.writeText(nit);
    toast({
      title: "Copiado",
      description: `NIT de ${nombre} copiado al portapapeles`,
    });
  };

  const handleInfo = (entidad: Entidad) => {
    toast({
      title: entidad.nombre,
      description: `NIT: ${entidad.nit} | Tipo: ${entidad.tipo} | Email: ${entidad.email}`,
    });
  };

  // Quick add Sede for this entidad (minimal prompt flow)
  const handleAddSede = (entidad: Entidad) => {
    const nombre = window.prompt(`Nuevo nombre de la sede para ${entidad.nombre}`);
    if (!nombre) return;
    const direccion = window.prompt("Dirección de la sede (opcional)") || "";
    const STORAGE_S = "gm_sedes_v1";
    const raw = localStorage.getItem(STORAGE_S);
    let sedes: any[] = [];
    if (raw) {
      try { sedes = JSON.parse(raw); } catch (e) { sedes = []; }
    }
    const newId = Math.max(0, ...sedes.map(s => s.id || 0)) + 1;
    const nuevaSede = {
      id: newId,
      sede: nombre,
      entidadId: entidad.id,
      entidadNombre: entidad.nombre,
      regional: "",
      ciudad: "",
      pais: "",
      direccion,
      telefono: "",
      areaM2: "",
      estado: "Activo",
    };
    sedes = [nuevaSede, ...sedes];
    localStorage.setItem(STORAGE_S, JSON.stringify(sedes));
    window.dispatchEvent(new Event('gm:sedes:updated'));
    toast({ title: 'Sede agregada', description: `Sede ${nombre} creada para ${entidad.nombre}` });
  };

  const handleExport = () => {
    if (selectedRows.size === 0) {
      toast({
        title: "Seleccione",
        description: "Debe seleccionar al menos una entidad para exportar",
        variant: "destructive",
      });
      return;
    }
    const selectedEntidades = entidades.filter((e) =>
      selectedRows.has(e.id)
    );
    const csv = [
      ["ID", "Nombre", "NIT", "Tipo", "Estado", "Email"].join(","),
      ...selectedEntidades.map((e) =>
        [e.id, e.nombre, e.nit, e.tipo, e.estado, e.email]
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "entidades.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: "Exportado",
      description: `${selectedRows.size} entidades exportadas a CSV`,
    });
  };

  const getStateBadge = (estado: string) => {
    return estado === "Activo" ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
    );
  };

  const getTypeBadge = (tipo: string) => {
    return tipo === "Interno" ? (
      <Badge className="bg-blue-100 text-blue-800">Interno</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">Externo</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Entidades: {filteredEntidades.length} / {entidades.length}
          </h1>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <Search size={20} className="text-gray-400" />
        <Input
          placeholder="Buscar por nombre, NIT o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-0 focus:ring-0 focus:outline-none"
        />
        <Button size="sm" variant="outline" onClick={() => handleInfo({} as any)}>
          <span className="text-xl">ℹ️</span>
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Copy size={16} />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleDeleteSelected}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={16} />
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <FileText size={16} className="mr-1" />
          Export
        </Button>
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleOpenAdd}
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-start gap-2">
          <span className="text-xl">🔔</span>
          <div>
            <h3 className="font-semibold">Entidades - la herramienta clave para el 2026</h3>
            <p className="text-sm mt-1">
              Ya estamos en vivo 🚀 En esta charla exploraremos cómo fortalecer tu gestión estratégica, mejorar la disponibilidad tecnológica y tomar decisiones precisas y respal... 
              <span className="text-cyan-100 cursor-pointer hover:underline">Regístrate aquí</span>
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredEntidades.length && filteredEntidades.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Id</TableHead>
                <TableHead className="font-semibold text-gray-700">Entidad</TableHead>
                <TableHead className="font-semibold text-gray-700">NIT</TableHead>
                <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Documentos</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntidades.map((entidad) => (
                <TableRow
                  key={entidad.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(entidad.id)}
                      onChange={() => handleSelectRow(entidad.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="text-gray-600 font-medium">{entidad.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{entidad.nombre}</TableCell>
                  <TableCell className="text-gray-600">{entidad.nit}</TableCell>
                  <TableCell>{getTypeBadge(entidad.tipo)}</TableCell>
                  <TableCell>{getStateBadge(entidad.estado)}</TableCell>
                  <TableCell className="text-gray-600 text-sm truncate">
                    {entidad.email}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDocuments(entidad)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <FileText size={16} className="mr-1" />
                      {(entidad.documentos || []).length > 0 ? (
                        <span>{(entidad.documentos || []).length}</span>
                      ) : (
                        <span>0</span>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInfo(entidad)}
                        title="Información"
                      >
                        <Info size={16} className="text-blue-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyNIT(entidad.nit, entidad.nombre)}
                        title="Copiar NIT"
                      >
                        <Copy size={16} className="text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(entidad)}
                        title="Editar"
                      >
                        <Edit size={16} className="text-yellow-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddSede(entidad)}
                        title="Agregar Sede"
                      >
                        <Plus size={16} className="text-purple-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:text-red-600"
                        title="Más opciones"
                      >
                        <ChevronRight size={16} className="text-gray-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openAdd || openEdit} onOpenChange={(open) => {
        if (!open) {
          setOpenAdd(false);
          setOpenEdit(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntidad ? "Editar Entidad" : "Agregar Nueva Entidad"}
            </DialogTitle>
            <DialogDescription>
              {editingEntidad ? "Actualiza los datos de la entidad" : "Completa los datos de la nueva entidad"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input
                placeholder="Nombre de la entidad"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIT *</label>
              <Input
                placeholder="Número de Identificación Tributaria"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interno">Interno</SelectItem>
                  <SelectItem value="Externo">Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Documentos</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.png,.zip"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload size={24} className="text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Arrastra archivos aquí o haz clic</p>
                    <p className="text-xs text-gray-500">PDF, DOC, XLS, JPG, PNG, ZIP</p>
                  </div>
                </label>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
                      <span>{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenAdd(false);
                setOpenEdit(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingEntidad ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar entidades?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar {selectedRows.size} entidad(es)? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Documents Dialog */}
      <Dialog open={openDocuments} onOpenChange={setOpenDocuments}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Documentos de {selectedEntidadDocs?.nombre}
            </DialogTitle>
            <DialogDescription>
              {selectedEntidadDocs?.documentos && selectedEntidadDocs.documentos.length > 0
                ? `Total: ${selectedEntidadDocs.documentos.length} documento(s)`
                : "Sin documentos agregados"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedEntidadDocs?.documentos && selectedEntidadDocs.documentos.length > 0 ? (
              selectedEntidadDocs.documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText size={20} className="text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {(doc.tamaño / 1024).toFixed(2)} KB • {doc.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Descargar"
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No hay documentos agregados</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDocuments(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Entidades;
