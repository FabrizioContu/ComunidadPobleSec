import { useState } from "react";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  AreaChart,
  Building,
  Home,
  School,
  SunIcon,
  Users,
  Calculator,
  BarChart2,
  Sliders,
} from "lucide-react";
import { Badge } from "./ui/badge";

// Consumer types with their annual consumption and contracted power
const consumerTypes = [
  { name: "Very Low Consumption", consumption: 600, power: 2.3 },
  { name: "Low Consumption", consumption: 900, power: 2.3 },
  { name: "Medium-Low Consumption", consumption: 1300, power: 3.45 },
  { name: "Medium Consumption", consumption: 1450, power: 3.45 },
  { name: "Medium-High Consumption", consumption: 1900, power: 4.6 },
  { name: "High Consumption", consumption: 2550, power: 4.6 },
  { name: "Association", consumption: 23500, power: 6.9 },
  { name: "School", consumption: 80900, power: 6.9 },
];

// Cost parameters - Fixed as requested
const costParams = {
  installationCost: 0.8, // euro/W
  electricityBuyPrice: 0.13, // euro/kWh
  electricitySellPrice: 0.06, // euro/kWh
  maintenanceCost: 25, // euro/kW/year
};

// Technical parameters - Fixed as requested
const techParams = {
  solarPowerDensity: 0.23, // kW/m2
  systemLosses: 25, // percentage
};

// Fixed Area value as requested
const FIXED_AREA = 360; // m²

// Colors for charts and visualizations
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

type ScenarioParams = {
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

export const SimulatorBis = () => {
  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [results, setResults] = useState<SimulationResult[]>([]);

  const handleScenarioChange = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    setScenarios((prev) => {
      const newScenarios = [...prev];
      if (field === "isDynamic") {
        newScenarios[index] = {
          ...newScenarios[index],
          isDynamic: Boolean(value),
        };
      } else if (field.startsWith("consumerCounts.")) {
        const consumerType = field.split(
          "."
        )[1] as keyof ScenarioParams["consumerCounts"];
        newScenarios[index] = {
          ...newScenarios[index],
          consumerCounts: {
            ...newScenarios[index].consumerCounts,
            [consumerType]: Number(value),
          },
        };
      }
      return newScenarios;
    });
  };

  // Create array for consumer distribution pie chart
  const getConsumerDistributionData = (scenarioIndex: number) => {
    const scenario = scenarios[scenarioIndex];
    return [
      {
        name: "Muy Bajo Consumo",
        value: scenario.consumerCounts.veryLowConsumption,
        icon: Home,
      },
      {
        name: "Bajo Consumo",
        value: scenario.consumerCounts.lowConsumption,
        icon: Home,
      },
      {
        name: "Consumo Medio-Bajo",
        value: scenario.consumerCounts.mediumLowConsumption,
        icon: Home,
      },
      {
        name: "Consumo Medio",
        value: scenario.consumerCounts.mediumConsumption,
        icon: Home,
      },
      {
        name: "Consumo Medio-Alto",
        value: scenario.consumerCounts.mediumHighConsumption,
        icon: Home,
      },
      {
        name: "Alto Consumo",
        value: scenario.consumerCounts.highConsumption,
        icon: Home,
      },
      {
        name: "Asociación",
        value: scenario.consumerCounts.association,
        icon: Building,
      },
      { name: "Escuela", value: scenario.consumerCounts.school, icon: School },
    ].filter((item) => item.value > 0);
  };

  // Calculate total consumers
  const getTotalConsumers = (scenarioIndex: number) => {
    const scenario = scenarios[scenarioIndex];
    return Object.values(scenario.consumerCounts).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  // // Calculate installation capacity using fixed area
  // const getInstallationCapacity = () => {
  //   return FIXED_AREA * techParams.solarPowerDensity;
  // };

  // // Get estimated generation
  // const getEstimatedGeneration = () => {
  //   return (
  //     getInstallationCapacity() * 1190 * (1 - techParams.systemLosses / 100)
  //   );
  // };

  // Create data for cost parameters visualization
  const getCostParamsData = () => {
    return [
      {
        name: "Coste Instalación",
        value: costParams.installationCost,
        unit: "€/kW",
        color: "#FF8042",
      },
      {
        name: "Precio Compra",
        value: costParams.electricityBuyPrice,
        unit: "€/kWh",
        color: "#0088FE",
      },
      {
        name: "Precio Venta",
        value: costParams.electricitySellPrice,
        unit: "€/kWh",
        color: "#00C49F",
      },
      {
        name: "Mantenimiento",
        value: costParams.maintenanceCost,
        unit: "€/kW/año",
        color: "#FFBB28",
      },
    ];
  };

  // Create data for tech parameters visualization
  const getTechParamsData = () => {
    return [
      {
        name: "Densidad Energética",
        value: techParams.solarPowerDensity,
        unit: "kW/m²",
        color: "#8884d8",
      },
      {
        name: "Pérdidas Sistema",
        value: techParams.systemLosses,
        unit: "%",
        color: "#82ca9d",
      },
    ];
  };

  const runSimulation = () => {
    // Filter to include only static scenarios
    const staticScenarios = scenarios.filter((scenario) => !scenario.isDynamic);

    const newResults = staticScenarios.map((scenario) => {
      // Calculate installed capacity with fixed area
      const installedCapacity = FIXED_AREA * techParams.solarPowerDensity;

      // Calculate total generation accounting for losses
      const totalGeneration =
        installedCapacity * 1190 * (1 - techParams.systemLosses / 100);

      // Calculate total consumption based on consumer counts
      const totalConsumption =
        scenario.consumerCounts.veryLowConsumption *
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

      // Calculate self-consumption (static coefficient calculation)
      const selfConsumption = Math.min(
        totalGeneration,
        totalConsumption * (totalGeneration < totalConsumption ? 0.7 : 0.5)
      );

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

      // Calculate first three houses' savings (as per your spreadsheet)
      const totalUsers =
        scenario.consumerCounts.veryLowConsumption +
        scenario.consumerCounts.lowConsumption +
        scenario.consumerCounts.mediumLowConsumption +
        scenario.consumerCounts.mediumConsumption +
        scenario.consumerCounts.mediumHighConsumption +
        scenario.consumerCounts.highConsumption +
        scenario.consumerCounts.association +
        scenario.consumerCounts.school;

      // Simple calculation for first three houses using proportion of total consumption
      const firstThreeConsumption =
        (3 * (consumerTypes[0].consumption + consumerTypes[1].consumption)) / 2;
      const firstThreeHousesSavings =
        (firstThreeConsumption / totalConsumption) * annualSavings;

      const savingsPerUser = totalUsers > 0 ? annualSavings / totalUsers : 0;

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
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Calculadora Solar Comunitaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Parámetros de Coste Fijos - Removed euro icons */}
              <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-orange-50 to-slate-50">
                <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 pt-2">
                    <Calculator size={20} className="text-amber-600" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-500">
                      Parámetros de Coste Fijos
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
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
                                  <span className="text-white font-bold text-lg">
                                    €
                                  </span>
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
                      Los parámetros de coste determinan la viabilidad económica
                      de la instalación solar. Estos valores están fijados según
                      estimaciones del mercado actual.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Parámetros Técnicos Fijos */}
              <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-slate-50">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 pt-2">
                    <Sliders size={20} className="text-blue-600" />
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
                              <p className="text-xs text-gray-500">
                                {param.unit}
                              </p>
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
                            <span className="text-xs text-gray-500 w-12">
                              0
                            </span>
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
                              {param.name === "Densidad Energética"
                                ? "0.5"
                                : "100"}
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
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Perfil de la Comunidad</h3>

            <Tabs defaultValue="scenario0">
              <TabsList className="mb-4">
                {scenarios.map((_, index) => (
                  <TabsTrigger key={index} value={`scenario${index}`}>
                    Escenario {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {scenarios.map((scenario, index) => (
                <TabsContent key={index} value={`scenario${index}`}>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Improved and Simplified Area Available Visualization - No chart */}
                    <Card className="bg-gradient-to-br from-blue-50 to-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AreaChart size={20} />
                          Área Disponible y Capacidad Solar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                          <div className="bg-white rounded-md px-3 py-5 border shadow  border-blue-200 flex flex-col gap-5 text-blue-600">
                            <div className="flex items-center justify-between">
                              {" "}
                              <span className="font-medium text-lg">
                                Área Disponible:{" "}
                              </span>{" "}
                              <span className="font-bold">{FIXED_AREA} m²</span>
                            </div>

                            <div className="h-1 w-full bg-gradient-to-r from-blue-200 to-blue-500 rounded-full mb-5"></div>
                          </div>
                          <div className="bg-white rounded-md px-3 py-5 border shadow  border-green-200 flex flex-col gap-5 text-green-600">
                            <div className="flex items-center justify-between">
                              {" "}
                              <span className="font-medium text-lg">
                                Capacidad Solar:
                              </span>{" "}
                              <span className="font-bold">
                                {360 * techParams.solarPowerDensity} kW
                              </span>
                            </div>
                            <div className="h-1 w-full bg-gradient-to-r from-green-200 to-green-500 rounded-full mb-5"></div>
                          </div>
                          <div className="bg-white rounded-md px-3 py-5 border shadow  border-amber-200 flex flex-col gap-5 text-amber-600">
                            <div className="flex items-center justify-between">
                              {" "}
                              <span className="font-medium text-lg">
                                Generación estimada:
                              </span>{" "}
                              <span className="font-bold ">
                                {360 *
                                  techParams.solarPowerDensity *
                                  ((1190 * 75) / 100)}
                                {"  "}
                                kWh/año
                              </span>
                            </div>

                            <div className="h-1 w-full bg-gradient-to-r from-amber-200 to-amber-500 rounded-full mb-5"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Consumer Distribution Visualization */}
                    <Card className="bg-gradient-to-br from-purple-50 to-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users size={20} />
                          Distribución de Consumidores
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                              {Object.entries(scenario.consumerCounts).map(
                                ([key, value], i) => {
                                  const Icon =
                                    i < 6 ? Home : i === 6 ? Building : School;
                                  const label = [
                                    "Muy Bajo Consumo",
                                    "Bajo Consumo",
                                    "Consumo Medio-Bajo",
                                    "Consumo Medio",
                                    "Consumo Medio-Alto",
                                    "Alto Consumo",
                                    "Asociación",
                                    "Escuela",
                                  ][i];
                                  const consumption =
                                    consumerTypes[i].consumption;

                                  return (
                                    <Card
                                      key={key}
                                      className={`border ${
                                        value > 0
                                          ? "border-purple-200 bg-white/70"
                                          : "border-slate-200 bg-white/30"
                                      }`}
                                    >
                                      <CardContent className="p-1">
                                        <div className="flex flex-col items-center">
                                          <div className="flex justify-center gap-2 items-center w-full mb-1">
                                            <Icon
                                              size={20}
                                              className="text-purple-600"
                                            />
                                            <Input
                                              type="number"
                                              className="w-14 h-8 text-sm text-center p-1"
                                              value={value}
                                              onChange={(e) =>
                                                handleScenarioChange(
                                                  index,
                                                  `consumerCounts.${key}`,
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </div>
                                          <p className="text-xs text-center font-medium line-clamp-1 py-1">
                                            {label}
                                          </p>
                                          <p className="text-xs text-muted-foreground text-center">
                                            ({consumption} kWh/año)
                                          </p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {/* Pie chart for consumer distribution */}
                          <div className="flex flex-col">
                            <div className="p-3 bg-white/80 rounded-lg border border-purple-100 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  Total Consumidores:
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100"
                                >
                                  {getTotalConsumers(index)}
                                </Badge>
                              </div>
                              {getTotalConsumers(index) > 0 && (
                                <div className="m-3 flex flex-wrap gap-2">
                                  {getConsumerDistributionData(index).map(
                                    (item, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="flex items-center gap-1 border-slate-200"
                                      >
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              COLORS[i % COLORS.length],
                                          }}
                                        />
                                        <span className="text-xs">
                                          {item.name}:{" "}
                                        </span>
                                        <span className="text-xs font-bold">
                                          {item.value}
                                        </span>
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                            {getTotalConsumers(index) > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart className="">
                                  <Pie
                                    data={getConsumerDistributionData(index)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({
                                      cx,
                                      cy,
                                      midAngle,
                                      innerRadius,
                                      outerRadius,
                                      value,
                                    }) => {
                                      const RADIAN = Math.PI / 180;
                                      const radius =
                                        innerRadius +
                                        (outerRadius - innerRadius) * 0.5;
                                      const x =
                                        cx +
                                        radius * Math.cos(-midAngle * RADIAN);
                                      const y =
                                        cy +
                                        radius * Math.sin(-midAngle * RADIAN);

                                      return value > 0 ? (
                                        <text
                                          x={x}
                                          y={y}
                                          fill="#fff"
                                          textAnchor={x > cx ? "start" : "end"}
                                          dominantBaseline="central"
                                          fontSize={12}
                                          fontWeight="bold"
                                        >
                                          {value}
                                        </text>
                                      ) : null;
                                    }}
                                  >
                                    {getConsumerDistributionData(index).map(
                                      (_, i) => (
                                        <Cell
                                          key={`cell-${i}`}
                                          fill={COLORS[i % COLORS.length]}
                                        />
                                      )
                                    )}
                                  </Pie>

                                  <Tooltip
                                    formatter={(value, name) => [
                                      `${value} consumidores`,
                                      name,
                                    ]}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Users size={40} strokeWidth={1} />
                                <p className="mt-2 text-sm">
                                  No hay consumidores definidos
                                </p>
                                <p className="text-xs">
                                  Añade consumidores para ver la distribución
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

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
        </CardContent>
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
                    <TabsList className="mb-4">
                      {results.map((_, index) => (
                        <TabsTrigger key={index} value={`result${index}`}>
                          Escenario {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>

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
                                      Factura sin Solar
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

            <TabsContent value="individual">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados por Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.length > 0 ? (
                    <div className="space-y-6">
                      <p className="text-center text-muted-foreground">
                        Los resultados muestran el ahorro estimado para
                        distintos tipos de consumidores
                      </p>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo de Consumidor</TableHead>
                            <TableHead className="text-right">
                              Consumo Anual
                            </TableHead>
                            <TableHead className="text-right">
                              Ahorro Estimado
                            </TableHead>
                            <TableHead className="text-right">
                              % Cubierto por Solar
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consumerTypes.slice(0, 6).map((consumer, i) => {
                            const result = results[0];
                            // Calculate individual savings proportional to consumption
                            const savingsProportion =
                              consumer.consumption / result.totalConsumption;
                            const individualSavings =
                              result.annualSavings * savingsProportion;
                            const coveragePercent =
                              result.selfConsumptionRateCons;

                            return (
                              <TableRow key={i}>
                                <TableCell>{consumer.name}</TableCell>
                                <TableCell className="text-right">
                                  {consumer.consumption} kWh/año
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600">
                                  {individualSavings.toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR",
                                    maximumFractionDigits: 0,
                                  })}
                                </TableCell>
                                <TableCell className="text-right">
                                  {coveragePercent.toFixed(0)}%
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-medium mb-2">
                          Notas sobre los Ahorros Individuales:
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>
                            Los ahorros son estimaciones basadas en el perfil de
                            consumo medio
                          </li>
                          <li>
                            Los valores reales pueden variar dependiendo de los
                            hábitos de consumo
                          </li>
                          <li>
                            Los cálculos no incluyen impuestos ni tasas
                            adicionales
                          </li>
                          <li>
                            El porcentaje cubierto por solar es el mismo para
                            todos los usuarios en este modelo simplificado
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        Ejecuta la simulación para ver resultados individuales
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SimulatorBis;
