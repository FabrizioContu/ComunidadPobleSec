import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AreaChart, Calculator, Sliders, SunIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

type ConsumerType = {
  name: string;
  consumption: number; // kWh/year
  power: number; // kW
}[];

const consumerTypes: ConsumerType = [
  { name: "Muy Bajo Consumo", consumption: 600, power: 2.3 },
  { name: "Bajo Consumo", consumption: 850, power: 2.3 },
  { name: "Medio-bajo Consumo", consumption: 1300, power: 3.45 },
  { name: "Medio Consumo", consumption: 1450, power: 3.45 },
  { name: "Medio-alto Consumo", consumption: 1900, power: 4.6 },
  { name: "Alto Consumo", consumption: 2500, power: 4.6 },
  { name: "Asociaciones", consumption: 23500, power: 6.9 },
  { name: "Escuelas", consumption: 80900, power: 6.9 },
];

type ScenarioParams = {
  // m²
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
};

const defaultScenarios: ScenarioParams[] = [
  {
    consumerCounts: {
      veryLowConsumption: 0,
      lowConsumption: 0,
      mediumLowConsumption: 0,
      mediumConsumption: 0,
      mediumHighConsumption: 0,
      highConsumption: 0,
      association: 0,
      school: 0,
    },
  },
];

const costParams: CostParams = {
  installationCost: 0.8, // euro/KW
  electricityBuyPrice: 0.13, // euro/kWh
  electricitySellPrice: 0.06, // euro/kWh
  maintenanceCost: 25, // euro/kW/year
};

const techParams: TechParams = {
  solarPowerDensity: 0.23, // kW/m2
  systemLosses: 25, // percentage
};
type SimulationResult = {
  installedCapacity: number; // kW
  totalGeneration: number; // kWh/year
  totalConsumption: number; // kWh/year
  selfConsumption: number; // kWh/year
  selfConsumptionRateGen: number; // % of generation self-consumed
  selfConsumptionRateCons: number; // % of consumption covered by solar
  combinedSelfConsumption: number; // combined metric
  installationCost: number; // euros
  yearlyOperationCost: number; // euros/year
  annualBill: number; // euros
  annualBillNoSolar: number; // euros
  annualSavings: number; // euros
  firstThreeHousesSavings: number; // euros
  savingsPerUser: number; // euros
  paybackPeriod: number; // years
};

function Simulator() {
  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [results, setResults] = useState<SimulationResult[]>([]);

  const getTotalConsumers = () => {
    return Object.values(scenarios[0].consumerCounts).reduce(
      (acc, curr) => acc + curr,
      0
    );
  };

  const runSimulation = () => {
    const newResults: SimulationResult[] = scenarios.map((scenario) => {
      // Calculate installed capacity
      const installedCapacity = 360 * techParams.solarPowerDensity; //

      // Calculate total generation accounting for losses
      const totalGeneration =
        installedCapacity * 1190 * (1 - techParams.systemLosses / 100);

      // Calculate total consumption based on consumer counts
      const totalConsumption =
        scenario.consumerCounts.veryLowConsumption +
        consumerTypes[0].consumption +
        scenario.consumerCounts.lowConsumption * consumerTypes[1].consumption +
        scenario.consumerCounts.mediumLowConsumption *
          consumerTypes[2].consumption +
        scenario.consumerCounts.mediumConsumption *
          consumerTypes[3].consumption +
        scenario.consumerCounts.mediumHighConsumption *
          consumerTypes[4].consumption +
        scenario.consumerCounts.highConsumption * consumerTypes[5].consumption +
        scenario.consumerCounts.association * consumerTypes[6].consumption +
        scenario.consumerCounts.school * consumerTypes[7].consumption;

      // Calculate self-consumption
      const selfConsumption = Math.min(totalGeneration, totalConsumption);

      // Calculate self-consumption rates
      const selfConsumptionRateGen = (selfConsumption / totalGeneration) * 100;
      const selfConsumptionRateCons =
        (selfConsumption / totalConsumption) * 100;
      const combinedSelfConsumption =
        (selfConsumptionRateGen * selfConsumptionRateCons) / 100;

      // Calculate economic results
      const installationCost =
        installedCapacity * 1000 * costParams.installationCost;
      const yearlyOperationCost =
        installedCapacity * costParams.maintenanceCost;

      // Calculate bill with solar
      const excessEnergy = totalGeneration - selfConsumption;
      const additionalEnergy = totalConsumption - selfConsumption;
      const annualBill =
        additionalEnergy * costParams.electricityBuyPrice -
        excessEnergy * costParams.electricitySellPrice;

      // Calculate bill without solar
      const annualBillNoSolar =
        totalConsumption * costParams.electricityBuyPrice;

      // Calculate savings
      const annualSavings =
        annualBillNoSolar - annualBill - yearlyOperationCost;
      const firstThreeHousesSavings = (annualSavings / getTotalConsumers()) * 3;

      const savingsPerUser = annualSavings / getTotalConsumers();

      // Calculate payback period
      const paybackPeriod = installationCost / annualSavings;

      return {
        installedCapacity,
        totalGeneration,
        totalConsumption,
        selfConsumption,
        selfConsumptionRateGen,
        selfConsumptionRateCons,
        combinedSelfConsumption,
        installationCost,
        yearlyOperationCost,
        annualBill,
        annualBillNoSolar,
        annualSavings,
        firstThreeHousesSavings,
        savingsPerUser,
        paybackPeriod,
      };
    });

    setResults(newResults);
  };

  return (
    <div>
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
                      {costParams.installationCost} €/kW
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
                <div className="bg-white rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                  <span className="font-medium">Área Disponible: </span>{" "}
                  <span className="font-bold">360 m²</span>
                </div>
                <div className="bg-white rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                  <span className="font-medium">Capacidad Solar:</span>{" "}
                  <span className="font-bold text-blue-500">
                    {360 * techParams.solarPowerDensity} kW
                  </span>
                </div>
                <div className="bg-white rounded-md px-3 py-5 border shadow  border-gray-200 flex items-center justify-between">
                  <span className="font-medium">Generación estimada:</span>{" "}
                  <span className="font-bold text-green-500">
                    {360 * techParams.solarPowerDensity * ((1190 * 75) / 100)}{" "}
                    kWh/año
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 px-6">
          <Card className=" py-4 px-3 bg-gray-50">
            <CardTitle className="text-lg flex items-center gap-2 text-green-600">
              <Users size={20} />
              <span className="text-lg font-medium">
                Distribución de Consumidores
              </span>
            </CardTitle>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {consumerTypes.map((consumer) => {
                  return (
                    <div
                      key={consumer.name}
                      className="bg-white rounded-md px-5 py-5 border shadow border-gray-200 grid grid-cols-3 gap-1 items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-semibold">
                          {consumer.name}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          ({consumer.consumption} kWh/año)
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          className="w-16 h-8 border border-gray-300 rounded-md px-2 mt-2"
                          value={
                            defaultScenarios[0].consumerCounts[
                              consumer.name
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  ""
                                ) as keyof ScenarioParams["consumerCounts"]
                            ]
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10) || 0;
                            setScenarios((prev) => {
                              const newScenarios = [...prev];
                              newScenarios[0].consumerCounts[
                                consumer.name
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    ""
                                  ) as keyof ScenarioParams["consumerCounts"]
                              ] = value;
                              return newScenarios;
                            });
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="p-3 bg-gradient-to-b from-green-300 to-green-100 rounded-lg border border-purple-100 shadow-sm">
                  <div className="flex justify-center place-content-center items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 py-4">
                      TOTAL CONSUMIDORES:
                    </span>
                    <p className="font-bold text-gray-800 bg-gray-50 p-2 rounded-md">
                      {getTotalConsumers()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <CardFooter className="flex justify-center">
          <div className="mt-6 flex justify-center">
            <Button
              onClick={runSimulation}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md gap-2"
            >
              <SunIcon size={18} />
              Ejecutar Simulación
            </Button>
          </div>
        </CardFooter>
      </Card>
      {results.length > 0 && (
        <>
          <Tabs defaultValue="community">
            <TabsList className="mb-4">
              <TabsTrigger value="community">
                Resultados Comunitarios
              </TabsTrigger>
              <TabsTrigger value="individual">
                Resultados Individuales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="community">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados de la Simulación Comunitaria</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="result0">
                    {results.map((result, index) => (
                      <TabsContent
                        key={index}
                        value={`result${index}`}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                Ahorro Anual de la Comunidad
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-green-600">
                                {result.annualSavings.toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {result.savingsPerUser.toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                  maximumFractionDigits: 0,
                                })}{" "}
                                por hogar medio
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                Periodo de Amortización
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-blue-600">
                                {result.paybackPeriod.toFixed(1)} años
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Inversión total:{" "}
                                {result.installationCost.toLocaleString(
                                  "es-ES",
                                  {
                                    style: "currency",
                                    currency: "EUR",
                                    maximumFractionDigits: 0,
                                  }
                                )}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                Autoconsumo de la Comunidad
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-purple-600">
                                {result.selfConsumptionRateCons.toFixed(0)}%
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {result.selfConsumptionRateGen.toFixed(0)}% de
                                generación usada in situ
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Balance Energético
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[250px]">
                                <ResponsiveContainer>
                                  <BarChart
                                    data={[
                                      {
                                        name: "Generación",
                                        SelfConsumed: result.selfConsumption,
                                        GridExport:
                                          result.totalGeneration -
                                          result.selfConsumption,
                                      },
                                      {
                                        name: "Consumo",
                                        SelfConsumed: result.selfConsumption,
                                        GridImport:
                                          result.totalConsumption -
                                          result.selfConsumption,
                                      },
                                    ]}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis
                                      label={{
                                        value: "Energía (kWh/año)",
                                        angle: -90,
                                        position: "insideLeft",
                                      }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                      dataKey="SelfConsumed"
                                      stackId="a"
                                      name="Autoconsumo"
                                      fill="#10B981"
                                    />
                                    <Bar
                                      dataKey="GridExport"
                                      stackId="a"
                                      name="Exportación a Red"
                                      fill="#34D399"
                                    />
                                    <Bar
                                      dataKey="GridImport"
                                      stackId="a"
                                      name="Importación de Red"
                                      fill="#3B82F6"
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Métricas Clave
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Capacidad Instalada
                                    </TableCell>
                                    <TableCell>
                                      {result.installedCapacity.toFixed(1)} kW
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Generación Total
                                    </TableCell>
                                    <TableCell>
                                      {result.totalGeneration.toFixed(0)}{" "}
                                      kWh/año
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Consumo Total
                                    </TableCell>
                                    <TableCell>
                                      {result.totalConsumption.toFixed(0)}{" "}
                                      kWh/año
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Autoconsumo
                                    </TableCell>
                                    <TableCell>
                                      {result.selfConsumption.toFixed(0)}{" "}
                                      kWh/año
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Factura Anual con Solar
                                    </TableCell>
                                    <TableCell>
                                      {result.annualBill.toLocaleString(
                                        "es-ES",
                                        {
                                          style: "currency",
                                          currency: "EUR",
                                          maximumFractionDigits: 0,
                                        }
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Factura Anual sin Solar
                                    </TableCell>
                                    <TableCell>
                                      {result.annualBillNoSolar.toLocaleString(
                                        "es-ES",
                                        {
                                          style: "currency",
                                          currency: "EUR",
                                          maximumFractionDigits: 0,
                                        }
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Coste de Operación
                                    </TableCell>
                                    <TableCell>
                                      {result.yearlyOperationCost.toLocaleString(
                                        "es-ES",
                                        {
                                          style: "currency",
                                          currency: "EUR",
                                          maximumFractionDigits: 0,
                                        }
                                      )}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
export default Simulator;
