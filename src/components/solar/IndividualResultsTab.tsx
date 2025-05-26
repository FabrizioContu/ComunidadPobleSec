import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { consumerTypes, useSolarStore } from "@/store/useSolarStore";

export const IndividualResultsTab = () => {
  const { results } = useSolarStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados por Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground">
              Los resultados muestran el ahorro estimado para distintos tipos de
              consumidores
            </p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Consumidor</TableHead>
                  <TableHead className="text-right">Consumo Anual</TableHead>
                  <TableHead className="text-right">Ahorro Estimado</TableHead>
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
                  const coveragePercent = result.selfConsumptionRateCons;

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
                  Los ahorros son estimaciones basadas en el perfil de consumo
                  medio
                </li>
                <li>
                  Los valores reales pueden variar dependiendo de los hábitos de
                  consumo
                </li>
                <li>Los cálculos no incluyen impuestos ni tasas adicionales</li>
                <li>
                  El porcentaje cubierto por solar es el mismo para todos los
                  usuarios en este modelo simplificado
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
  );
};
