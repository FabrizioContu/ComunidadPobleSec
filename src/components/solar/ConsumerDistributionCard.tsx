import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, Building, School, Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import {
  useSolarStore,
  getConsumerDistributionData,
  getTotalConsumers,
  consumerTypes,
} from "@/store/useSolarStore";

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

type ConsumerDistributionCardProps = {
  scenarioIndex: number;
};

export const ConsumerDistributionCard = ({
  scenarioIndex,
}: ConsumerDistributionCardProps) => {
  const { scenarios, updateScenario } = useSolarStore();
  const scenario = scenarios[scenarioIndex];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users size={20} />
          Distribución de Consumidores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {Object.entries(scenario.consumerCounts).map(
                ([key, value], i) => {
                  const Icon = i < 6 ? Home : i === 6 ? Building : School;
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
                  const consumption = consumerTypes[i].consumption;

                  return (
                    <Card
                      key={key}
                      className={`border ${
                        value > 0
                          ? "border-purple-200 bg-white/70"
                          : "border-slate-200 bg-white/30"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex justify-between items-center w-full mb-1">
                            <Icon size={14} className="text-purple-600" />
                            <Input
                              type="number"
                              className="w-14 h-8 text-sm text-center p-1"
                              value={value}
                              onChange={(e) =>
                                updateScenario(
                                  scenarioIndex,
                                  `consumerCounts.${key}`,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <p className="text-xs text-center font-medium line-clamp-1">
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
            <div className="p-3 bg-white/80 rounded-lg border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Consumidores:</span>
                <Badge variant="outline" className="bg-purple-100">
                  {getTotalConsumers(scenarioIndex)}
                </Badge>
              </div>
              {getTotalConsumers(scenarioIndex) > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {getConsumerDistributionData(scenarioIndex).map((item, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="flex items-center gap-1 border-slate-200"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-xs">{item.name}: </span>
                      <span className="text-xs font-bold">{item.value}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pie chart for consumer distribution */}
          <div className="h-[280px]">
            {getTotalConsumers(scenarioIndex) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getConsumerDistributionData(scenarioIndex)}
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
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

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
                    {getConsumerDistributionData(scenarioIndex).map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, name) => [`${value} consumidores`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={40} strokeWidth={1} />
                <p className="mt-2 text-sm">No hay consumidores definidos</p>
                <p className="text-xs">
                  Añade consumidores para ver la distribución
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
