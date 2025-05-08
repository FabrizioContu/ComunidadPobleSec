import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function Simulator() {
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

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Simulator;
