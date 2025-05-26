import { create } from 'zustand'


// Consumer types with their annual consumption and contracted power
export const consumerTypes = [
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
export const costParams = {
  installationCost: 0.8, // euro/W
  electricityBuyPrice: 0.13, // euro/kWh
  electricitySellPrice: 0.06, // euro/kWh
  maintenanceCost: 25, // euro/kW/year
};

// Technical parameters - Fixed as requested
export const techParams = {
  solarPowerDensity: 0.23, // kW/m2
  systemLosses: 25, // percentage
};

// Fixed Area value as requested
export const FIXED_AREA = 360; // m²

// Colors for charts and visualizations
export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

export type ScenarioParams = {
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

export const defaultScenarios: ScenarioParams[] = [
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

export type SimulationResult = {
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

interface SolarStoreState {
  scenarios: ScenarioParams[];
  results: SimulationResult[];
  setScenarios: (scenarios: ScenarioParams[]) => void;
  updateScenario: (index: number, field: string, value: string | number | boolean) => void;
  runSimulation: () => void;
}
export const useSolarStore = create<SolarStoreState>((set, get) => ({
  scenarios: [...defaultScenarios],
  results: [],
  
  setScenarios: (scenarios) => set({ scenarios }),
  
  updateScenario: (index, field, value) => set((state) => {
    const newScenarios = [...state.scenarios];
    if (field === "isDynamic") {
      newScenarios[index] = {
        ...newScenarios[index],
        isDynamic: Boolean(value)
      };
    } else if (field.startsWith("consumerCounts.")) {
      const consumerType = field.split(".")[1] as keyof ScenarioParams["consumerCounts"];
      newScenarios[index] = {
        ...newScenarios[index],
        consumerCounts: {
          ...newScenarios[index].consumerCounts,
          [consumerType]: Number(value)
        }
      };
    }
    return { scenarios: newScenarios };
  }),
runSimulation: () => {
    const { scenarios } = get();
    
    // Filter to include only static scenarios
    const staticScenarios = scenarios.filter(scenario => !scenario.isDynamic);
    
    const newResults = staticScenarios.map((scenario) => {
      // Calculate installed capacity with fixed area
      const installedCapacity = FIXED_AREA * techParams.solarPowerDensity;
      
      // Calculate total generation accounting for losses
      const totalGeneration = installedCapacity * 1190 * (1 - techParams.systemLosses / 100);
      
      // Calculate total consumption based on consumer counts
      const totalConsumption = 
        scenario.consumerCounts.veryLowConsumption * consumerTypes[0].consumption +
        scenario.consumerCounts.lowConsumption * consumerTypes[1].consumption +
        scenario.consumerCounts.mediumLowConsumption * consumerTypes[2].consumption +
        scenario.consumerCounts.mediumConsumption * consumerTypes[3].consumption +
        scenario.consumerCounts.mediumHighConsumption * consumerTypes[4].consumption +
        scenario.consumerCounts.highConsumption * consumerTypes[5].consumption +
        scenario.consumerCounts.association * consumerTypes[6].consumption +
        scenario.consumerCounts.school * consumerTypes[7].consumption;
      
      // Calculate self-consumption (static coefficient calculation)
      const selfConsumption = Math.min(totalGeneration, 
        totalConsumption * (totalGeneration < totalConsumption ? 0.70 : 0.50));
      
      // Calculate self-consumption rates
      const selfConsumptionRateGen = (selfConsumption / totalGeneration) * 100;
      const selfConsumptionRateCons = (selfConsumption / totalConsumption) * 100;
      const combinedSelfConsumption = (selfConsumptionRateGen * selfConsumptionRateCons) / 100;
      
      // Calculate economic results
      const installationCost = installedCapacity * 1000 * costParams.installationCost;
      const yearlyOperationCost = installedCapacity * costParams.maintenanceCost;
      
      // Calculate bill with solar
      const excessEnergy = totalGeneration - selfConsumption;
      const additionalEnergy = totalConsumption - selfConsumption;
      const annualBill = 
        additionalEnergy * costParams.electricityBuyPrice - 
        excessEnergy * costParams.electricitySellPrice;
      
      // Calculate bill without solar
      const annualBillNoSolar = totalConsumption * costParams.electricityBuyPrice;
      
      // Calculate savings
      const annualSavings = annualBillNoSolar - annualBill - yearlyOperationCost;
      
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
        3 * (consumerTypes[0].consumption + consumerTypes[1].consumption) / 2;
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
        paybackPeriod
      };
    });
    
    set({ results: newResults });
  }
}));

// Helper functions that can be used across components
export const getConsumerDistributionData = (scenarioIndex: number) => {
  const { scenarios } = useSolarStore.getState();
  const scenario = scenarios[scenarioIndex];
  
  if (!scenario) return [];
  
  return [
    { name: "Muy Bajo Consumo", value: scenario.consumerCounts.veryLowConsumption },
    { name: "Bajo Consumo", value: scenario.consumerCounts.lowConsumption },
    { name: "Consumo Medio-Bajo", value: scenario.consumerCounts.mediumLowConsumption },
    { name: "Consumo Medio", value: scenario.consumerCounts.mediumConsumption },
    { name: "Consumo Medio-Alto", value: scenario.consumerCounts.mediumHighConsumption },
    { name: "Alto Consumo", value: scenario.consumerCounts.highConsumption },
    { name: "Asociación", value: scenario.consumerCounts.association },
    { name: "Escuela", value: scenario.consumerCounts.school },
  ].filter(item => item.value > 0);
};

export const getTotalConsumers = (scenarioIndex: number) => {
  const { scenarios } = useSolarStore.getState();
  const scenario = scenarios[scenarioIndex];
  
  if (!scenario) return 0;
  
  return Object.values(scenario.consumerCounts).reduce((sum, count) => sum + count, 0);
};

export const getInstallationCapacity = () => {
  return FIXED_AREA * techParams.solarPowerDensity;
};

export const getEstimatedGeneration = () => {
  return getInstallationCapacity() * 1190 * (1 - techParams.systemLosses / 100);
};
