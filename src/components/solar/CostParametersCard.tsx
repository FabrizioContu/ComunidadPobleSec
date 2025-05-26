import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { costParams } from "@/store/useSolarStore";

export const CostParametersCard = () => {
  // Create data for cost parameters visualization
  const getCostParamsData = () => {
    return [
      {
        name: "Coste Instalación",
        value: costParams.installationCost,
        unit: "€/W",
        color: "#FF8042",
        icon: "euro",
      },
      {
        name: "Precio Compra",
        value: costParams.electricityBuyPrice,
        unit: "€/kWh",
        color: "#0088FE",
        icon: "arrow-down-to-line",
      },
      {
        name: "Precio Venta",
        value: costParams.electricitySellPrice,
        unit: "€/kWh",
        color: "#00C49F",
        icon: "arrow-up-from-line",
      },
      {
        name: "Mantenimiento",
        value: costParams.maintenanceCost,
        unit: "€/kW/año",
        color: "#FFBB28",
        icon: "wrench",
      },
    ];
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-tr from-amber-50 via-white to-orange-50">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="bg-amber-600 text-white p-1.5 rounded-md">
            <Calculator size={18} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-500">
            Parámetros de Coste Fijos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {getCostParamsData().map((param, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 transition-all hover:shadow-md group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${param.color}20` }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                        style={{ backgroundColor: param.color }}
                      >
                        <span className="text-white font-bold text-lg">€</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500">
                        {param.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {param.unit}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: param.color }}
                  >
                    {param.value}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="h-full transition-all group-hover:w-full"
                    style={{
                      backgroundColor: param.color,
                      width:
                        param.name === "Coste Instalación"
                          ? "80%"
                          : param.name === "Precio Compra"
                          ? "100%"
                          : param.name === "Precio Venta"
                          ? "46%"
                          : "70%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
          <h4 className="text-xs font-semibold text-amber-800 mb-1">
            Impacto Económico
          </h4>
          <p className="text-xs text-amber-700">
            Los parámetros de coste determinan la viabilidad económica de la
            instalación solar. Estos valores están fijados según estimaciones
            del mercado actual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
