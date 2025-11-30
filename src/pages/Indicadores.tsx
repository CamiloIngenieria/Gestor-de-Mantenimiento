import React from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import * as Recharts from "recharts";

const donutData = [
  { name: "Cumplimiento", value: 78 },
  { name: "No cumplimiento", value: 22 },
];

const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const preventiveData = months.map((m, i) => ({ month: m, value: Math.max(50, Math.round(70 + Math.sin(i/2)*15)) }));
const calibrationData = months.map((m, i) => ({ month: m, value: Math.max(40, Math.round(60 + Math.cos(i/3)*10)) }));

export default function Indicadores() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Indicadores</h1>
      <p className="text-sm text-muted-foreground">Visualización del cumplimiento de mantenimiento preventivo y calibración</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 col-span-1">
          <h3 className="font-medium mb-2">Resumen cumplimiento</h3>
          <ChartContainer
            className="h-56"
            config={{ Cumplimiento: { color: "#10b981", label: "Cumplimiento" }, "No cumplimiento": { color: "#ef4444", label: "No cumplimiento" } }}
          >
            <Recharts.PieChart>
              <Recharts.Pie data={donutData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2} labelLine={false} startAngle={90} endAngle={-270}>
                {donutData.map((entry, index) => (
                  <Recharts.Cell key={`cell-${index}`} fill={index === 0 ? "var(--color-Cumplimiento)" : "var(--color-No cumplimiento)"} />
                ))}
              </Recharts.Pie>
              <Recharts.Tooltip content={<div />} />
            </Recharts.PieChart>
          </ChartContainer>
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-sm" />
              <span>Preventivo cumplimiento: <strong>78%</strong></span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-sm" />
              <span>No cumplimiento: <strong>22%</strong></span>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:col-span-2">
          <h3 className="font-medium mb-2">Cumplimiento mensual</h3>
          <ChartContainer
            className="h-64"
            config={{ Preventivo: { color: "#6366f1", label: "Mantenimiento preventivo" }, Calibracion: { color: "#06b6d4", label: "Calibración" } }}
          >
            <Recharts.BarChart data={months.map((m, i) => ({ month: m, Preventivo: preventiveData[i].value, Calibracion: calibrationData[i].value }))} margin={{ top: 8, right: 24, left: 8, bottom: 30 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis dataKey="month" />
              <Recharts.YAxis />
              <Recharts.Tooltip />
              <Recharts.Legend content={<ChartLegendContent />} />
              <Recharts.Bar dataKey="Preventivo" stackId="a" fill="var(--color-Preventivo)" />
              <Recharts.Bar dataKey="Calibracion" stackId="a" fill="var(--color-Calibracion)" />
            </Recharts.BarChart>
          </ChartContainer>
        </Card>
      </div>

    </div>
  );
}
