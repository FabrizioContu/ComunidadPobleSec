import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSolarStore } from "@/store/useSolarStore";

export const CommunityResultsTab = () => {
  const { results } = useSolarStore();

  return (
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
                      {result.installationCost.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
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
                      {result.selfConsumptionRateGen.toFixed(0)}% de generación
                      usada in situ
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
                                result.totalGeneration - result.selfConsumption,
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
                    <CardTitle className="text-lg">Métricas Clave</CardTitle>
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
                            {result.totalGeneration.toFixed(0)} kWh/año
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Consumo Total
                          </TableCell>
                          <TableCell>
                            {result.totalConsumption.toFixed(0)} kWh/año
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Autoconsumo
                          </TableCell>
                          <TableCell>
                            {result.selfConsumption.toFixed(0)} kWh/año
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Factura Anual con Solar
                          </TableCell>
                          <TableCell>
                            {result.annualBill.toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Factura sin Solar
                          </TableCell>
                          <TableCell>
                            {result.annualBillNoSolar.toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            })}
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
  );
};
