import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SunIcon } from "lucide-react";
import { CostParametersCard } from "./CostParametersCard";
import { TechParametersCard } from "./TechParametersCard";
import { AreaCapacityCard } from "./AreaCapacityCard";
import { ConsumerDistributionCard } from "./ConsumerDistributionCard";
import { CommunityResultsTab } from "./CommunityResultsTab";
import { IndividualResultsTab } from "./IndividualResultsTab";
import { useSolarStore } from "@/store/useSolarStore";

export const SolarCalculator = () => {
  const { scenarios, results, runSimulation } = useSolarStore();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora Solar Comunitaria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CostParametersCard />
              <TechParametersCard />
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

              {scenarios.map((_, index) => (
                <TabsContent key={index} value={`scenario${index}`}>
                  <div className="grid grid-cols-1 gap-6">
                    <AreaCapacityCard />
                    <ConsumerDistributionCard scenarioIndex={index} />
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
        <Tabs defaultValue="community">
          <TabsList className="mb-4">
            <TabsTrigger value="community">Resultados Comunitarios</TabsTrigger>
            <TabsTrigger value="individual">
              Resultados Individuales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community">
            <CommunityResultsTab />
          </TabsContent>

          <TabsContent value="individual">
            <IndividualResultsTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
