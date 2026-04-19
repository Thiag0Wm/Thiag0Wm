export type EntityType = 'MAN' | 'WOMAN' | 'CHILDBOY' | 'CHILDGIRL' | 'OLDMAN' | 'OLDWOMAN' | 'DOG' | 'CAT' | 'DOCTOR' | 'PREGNANT' | 'FATMAN';

export interface Entity {
  type: EntityType;
  label: string;
}

export type Legality = 'LEGAL' | 'ILLEGAL' | 'NONE';

export interface Scenario {
  id: string;
  entities: Entity[];
  isPassengers: boolean;
  legality: Legality;
}

export interface Dilemma {
  left: Scenario;
  right: Scenario;
}

export interface Decision {
  chosenScenario: Scenario;
  otherScenario: Scenario;
}

export interface DilemmaFilters {
  prioritizeType?: EntityType;
  forceLegality?: Legality;
  minEntities?: number;
}

export interface MoralStats {
  savedHumans: number;
  savedAnimals: number;
  savedYoung: number;
  savedOld: number;
  savedLegal: number;
  savedFemale: number;
  savedMale: number;
  totalHumans: number;
  totalAnimals: number;
  totalYoung: number;
  totalOld: number;
  totalFemale: number;
  totalMale: number;
  totalDecisions: number;
  history: Decision[];
}
