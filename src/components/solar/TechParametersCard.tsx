import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sliders, SunIcon, BarChart2 } from "lucide-react";
import { techParams } from "@/store/useSolarStore";

export const TechParametersCard = () => {
  // Create data for tech parameters visualization
  const getTechParamsData = () => {
    return [
      {
        name: "Densidad Energética",
        value: techParams.solarPowerDensity,
        unit: "kW/m²",
        color: "#8884d8",
        icon: "sun",
      },
      {
        name: "Pérdidas Sistema",
        value: techParams.systemLosses,
        unit: "%",
        color: "#82ca9d",
        icon: "percent",
      },
    ];
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-tr from-blue-50 via-white to-indigo-50">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-md">
            <Sliders size={18} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            Parámetros Técnicos Fijos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 mt-2">
          {getTechParamsData().map((param, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 transition-all hover:shadow-md relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-5"
                style={{ backgroundColor: param.color }}
              ></div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${param.color}20` }}
                  >
                    <div
                      className="h-10 w-10 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: param.color }}
                    >
                      {param.name === "Densidad Energética" ? (
                        <SunIcon size={20} className="text-white" />
                      ) : (
                        <BarChart2 size={20} className="text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      {param.name}
                    </h4>
                    <p className="text-xs text-gray-500">{param.unit}</p>
                  </div>
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: param.color }}
                >
                  {param.value}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 w-12">0</span>
                  <div className="flex-1 mx-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full relative"
                        style={{
                          backgroundColor: param.color,
                          width:
                            param.name === "Densidad Energética"
                              ? `${param.value * 100 * 2}%`
                              : `${param.value}%`,
                        }}
                      >
                        <div
                          className="absolute -right-1 -top-1 w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: param.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {param.name === "Densidad Energética" ? "0.5" : "100"}
                  </span>
                </div>

                <div className="mt-3 p-2 bg-blue-50/70 rounded-md">
                  <p className="text-xs text-blue-700">
                    {param.name === "Densidad Energética"
                      ? "Representa la potencia solar instalable por m² de superficie."
                      : "Refleja las pérdidas totales del sistema por orientación, sombras y equipo."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
