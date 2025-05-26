import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, SunIcon, BarChart2 } from "lucide-react";
import {
  FIXED_AREA,
  getEstimatedGeneration,
  getInstallationCapacity,
} from "@/store/useSolarStore";

export const AreaCapacityCard = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AreaChart size={20} />
          Área Disponible y Capacidad Solar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          <div className="flex flex-col justify-center">
            <div className="p-6 bg-white/80 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <AreaChart size={24} className="text-blue-600" />
                  </div>
                  <span className="font-medium text-blue-800">
                    Área Disponible
                  </span>
                </div>
                <div className="font-bold text-blue-700">{FIXED_AREA} m²</div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-200 to-blue-500 rounded-full mb-5"></div>
            </div>
          </div>
          <div className="bg-white rounded-md px-3 py-5 border shadow  border-green-200 flex flex-col gap-5 text-green-600">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <SunIcon size={24} className="text-green-600" />
              </div>{" "}
              <span className="font-medium">Capacidad Solar:</span>{" "}
              <span className="font-bold">
                {getInstallationCapacity().toFixed(1)} kW
              </span>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-green-200 to-green-500 rounded-full mb-5"></div>
          </div>
          <div className="bg-white rounded-md px-3 py-5 border shadow  border-amber-200 flex flex-col gap-5 text-amber-600">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-full">
                <BarChart2 size={24} className="text-amber-600" />
              </div>{" "}
              <span className="font-medium">Generación estimada:</span>{" "}
              <span className="font-bold">
                {Math.round(getEstimatedGeneration()).toLocaleString()} kWh/año
              </span>
            </div>

            <div className="h-1 w-full bg-gradient-to-r from-amber-200 to-amber-500 rounded-full mb-5"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
