import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const InformeDocumental = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Informe Documental</h1>
        <p className="text-muted-foreground">
          Documentación técnica y certificaciones de equipos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Manuales de Usuario", count: 45, tipo: "PDF" },
          { title: "Certificados de Calibración", count: 32, tipo: "PDF" },
          { title: "Hojas de Vida", count: 156, tipo: "PDF" },
          { title: "Protocolos de Mantenimiento", count: 28, tipo: "PDF" },
          { title: "Fichas Técnicas", count: 156, tipo: "PDF" },
          { title: "Garantías", count: 89, tipo: "PDF" },
        ].map((doc, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">{doc.tipo}</span>
                </div>
                <h3 className="font-semibold text-foreground">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.count} documentos</p>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Documentos Recientes</h3>
        <div className="space-y-3">
          {[
            {
              nombre: "Manual Equipo LAB-001",
              fecha: "20 Nov 2025",
              tipo: "Manual de Usuario",
            },
            {
              nombre: "Certificado Calibración LAB-002",
              fecha: "18 Nov 2025",
              tipo: "Certificado",
            },
            {
              nombre: "Hoja de Vida LAB-003",
              fecha: "15 Nov 2025",
              tipo: "Hoja de Vida",
            },
          ].map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{doc.nombre}</p>
                  <p className="text-sm text-muted-foreground">{doc.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{doc.fecha}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InformeDocumental;
