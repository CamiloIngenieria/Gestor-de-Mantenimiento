import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function CronogramaAnual() {
  const [selectedYear, setSelectedYear] = useState(2025);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Cronograma Anual</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSelectedYear(selectedYear - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[100px] text-center">{selectedYear}</span>
          <Button variant="ghost" size="icon" onClick={() => setSelectedYear(selectedYear + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de meses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month, index) => (
          <div key={month} className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{month}</h3>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {Math.floor(Math.random() * 20) + 5} mantenimientos programados
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
                  Preventivo: {Math.floor(Math.random() * 15) + 3}
                </Badge>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                  Correctivo: {Math.floor(Math.random() * 5) + 1}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen anual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Mantenimientos</div>
          <div className="text-2xl font-bold text-foreground">248</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Preventivos</div>
          <div className="text-2xl font-bold text-green-600">198</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Correctivos</div>
          <div className="text-2xl font-bold text-amber-600">50</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Tasa de Cumplimiento</div>
          <div className="text-2xl font-bold text-primary">94%</div>
        </div>
      </div>
    </div>
  );
}
