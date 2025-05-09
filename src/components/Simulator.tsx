import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AreaChart, Calculator, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type CostParams = {
  installationCost: number; // euro/W
  electricityBuyPrice: number; // euro/kWh
  electricitySellPrice: number; // euro/kWh
  maintenanceCost: number;
};
// euro/kW/year
type TechParams = {
  solarPowerDensity: number; // kW/m2
  systemLosses: number; // percentage
};

type ScenarioParams = {
  availableArea: number; // m²
  consumerCounts: {
    veryLowConsumption: number;
    lowConsumption: number;
    mediumLowConsumption: number;
    mediumConsumption: number;
    mediumHighConsumption: number;
    highConsumption: number;
    association: number;
    school: number;
  };
  isDynamic: boolean;
};

const defaultScenarios: ScenarioParams[] = [
  {
    availableArea: 360,
    consumerCounts: {
      veryLowConsumption: 5,
      lowConsumption: 5,
      mediumLowConsumption: 10,
      mediumConsumption: 10,
      mediumHighConsumption: 5,
      highConsumption: 5,
      association: 0,
      school: 0,
    },
    isDynamic: false,
  },
];
const costParams: CostParams = {
  installationCost: 0.8, // euro/W
  electricityBuyPrice: 0.13, // euro/kWh
  electricitySellPrice: 0.06, // euro/kWh
  maintenanceCost: 25, // euro/kW/year
};

const techParams: TechParams = {
  solarPowerDensity: 0.23, // kW/m2
  systemLosses: 25, // percentage
};
function Simulator() {
  const [scenarios, setScenarios] = useState(defaultScenarios);

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800 text-2xl font-semibold">
            Simulador de consumo de paneles solares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="py-4 px-3 bg-gradient-to-b from-blue-100 to-cyan-50 pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                  <Calculator size={20} />
                  <span className="text-lg font-medium">
                    Parametros Económicos
                  </span>
                </CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 py-4 gap-4 mt-2">
                  <div className="bg-gray-50 rounded-md px-3 py-5 border shadow border-gray-200 flex items-center justify-between">
                    <span className="text-base font-semibold ">
                      Coste Instalación:
                    </span>{" "}
                    <span className="font-bold">
                      {costParams.installationCost} €/W
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                    <span className="font-medium">Precio Compra:</span>{" "}
                    <span className="font-bold">
                      {" "}
                      {costParams.electricityBuyPrice} €/kWh
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                    <span className="font-medium">Precio Venta:</span>{" "}
                    <span className="font-bold">
                      {" "}
                      {costParams.electricitySellPrice}
                      €/kWh
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                    <span className="font-medium">Mantenimiento:</span>{" "}
                    <span className="font-bold">
                      {costParams.maintenanceCost} €/kW/año
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="py-4 px-3 bg-gradient-to-b from-amber-100 to-amber-50 pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                  <Sliders size={20} />
                  <span className="text-lg font-medium">
                    Parametros Técnicos
                  </span>
                </CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-gray-50 rounded-md px-3 py-8 border shadow  border-gray-200 flex items-center justify-between">
                    <span className="font-medium">Densidad Energía:</span>{" "}
                    <span className="font-bold">
                      {techParams.solarPowerDensity} kW/m²
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-8 border shadow  border-gray-200 flex items-center justify-between">
                    <span className="font-medium">Pérdidas del Sistema:</span>{" "}
                    <span className="font-bold">
                      {techParams.systemLosses}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
        <div>
          <h3 className="text-gray-800 text-2xl font-semibold ps-6">
            Perfil de la Comunidad
          </h3>
        </div>
        <div className="grid grid-cols-1 px-6">
          <Card className=" py-4 px-3 bg-gray-50">
            <CardTitle className="text-lg flex items-center gap-2 text-green-600">
              <AreaChart size={20} />
              <span className="text-lg font-medium">
                Área Disponible (m²) y Capacidad Solar
              </span>
            </CardTitle>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="bg-gray-50 rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                  <span className="font-medium">Área Disponible: </span>{" "}
                  <span className="font-bold">
                    {scenarios[0].availableArea} m²
                  </span>
                </div>
                <div className="bg-gray-50 rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                  <span className="font-medium">Capacidad Solar:</span>{" "}
                  <span className="font-bold">
                    {scenarios[0].availableArea * techParams.solarPowerDensity}{" "}
                    kW
                  </span>
                </div>
                <div className="bg-gray-50 rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                  <span className="font-medium">Generación estimada:</span>{" "}
                  <span className="font-bold">
                    {scenarios[0].availableArea *
                      techParams.solarPowerDensity *
                      ((1190 * 75) / 100)}{" "}
                    kWh/año
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <CardFooter className="flex justify-center">
          <Button>Ver resultados</Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default Simulator;
