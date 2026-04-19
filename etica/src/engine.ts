import { EntityType, Entity, Scenario, Dilemma, Decision, Legality, DilemmaFilters } from './types.ts';

const ENTITIES: Record<EntityType, { label: string; isHuman: boolean; isYoung: boolean; isOld: boolean; isFemale: boolean; isMale: boolean }> = {
  MAN: { label: 'Homem', isHuman: true, isYoung: false, isOld: false, isFemale: false, isMale: true },
  WOMAN: { label: 'Mulher', isHuman: true, isYoung: false, isOld: false, isFemale: true, isMale: false },
  CHILDBOY: { label: 'Menino', isHuman: true, isYoung: true, isOld: false, isFemale: false, isMale: true },
  CHILDGIRL: { label: 'Menina', isHuman: true, isYoung: true, isOld: false, isFemale: true, isMale: false },
  OLDMAN: { label: 'Idoso', isHuman: true, isYoung: false, isOld: true, isFemale: false, isMale: true },
  OLDWOMAN: { label: 'Idosa', isHuman: true, isYoung: false, isOld: true, isFemale: true, isMale: false },
  DOG: { label: 'Cachorro', isHuman: false, isYoung: false, isOld: false, isFemale: false, isMale: false },
  CAT: { label: 'Gato', isHuman: false, isYoung: false, isOld: false, isFemale: false, isMale: false },
  DOCTOR: { label: 'Médico(a)', isHuman: true, isYoung: false, isOld: false, isFemale: false, isMale: false },
  PREGNANT: { label: 'Gestante', isHuman: true, isYoung: false, isOld: false, isFemale: true, isMale: false },
  FATMAN: { label: 'Homem Grande', isHuman: true, isYoung: false, isOld: false, isFemale: false, isMale: true },
};

export class MoralEngine {
  private history: Decision[] = [];
  private currentRound: number = 0;
  private readonly TOTAL_ROUNDS = 13;
  private complexity: 'SIMPLE' | 'CHAOTIC' = 'SIMPLE';
  private filters: DilemmaFilters = {};

  constructor() {}

  public setComplexity(complexity: 'SIMPLE' | 'CHAOTIC') {
    this.complexity = complexity;
  }

  public setFilters(filters: DilemmaFilters) {
    this.filters = filters;
  }

  public getProgress(): number {
    return (this.currentRound / this.TOTAL_ROUNDS) * 100;
  }

  public generateDilemma(): Dilemma {
    const isLeftPassengers = Math.random() > 0.5;
    
    return {
      left: this.generateScenario(isLeftPassengers, 'left'),
      right: this.generateScenario(!isLeftPassengers, 'right'),
    };
  }

  private generateScenario(isPassengers: boolean, side: string): Scenario {
    const maxEntities = this.complexity === 'SIMPLE' ? 2 : 5;
    let count = Math.floor(Math.random() * maxEntities) + 1;
    
    if (this.filters.minEntities && count < this.filters.minEntities) {
      count = this.filters.minEntities;
    }

    const entities: Entity[] = [];
    const entityTypes = Object.keys(ENTITIES) as EntityType[];

    // Priority entity
    if (this.filters.prioritizeType) {
      entities.push({ type: this.filters.prioritizeType, label: ENTITIES[this.filters.prioritizeType].label });
    }

    for (let i = entities.length; i < count; i++) {
        const type = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        entities.push({ type, label: ENTITIES[type].label });
    }

    let legality: Legality = 'NONE';
    if (!isPassengers) {
        if (this.filters.forceLegality && this.filters.forceLegality !== 'NONE') {
          legality = this.filters.forceLegality;
        } else {
          legality = Math.random() > 0.5 ? 'LEGAL' : 'ILLEGAL';
        }
    }

    return {
      id: `${side}-${Date.now()}-${Math.random()}`,
      entities,
      isPassengers,
      legality,
    };
  }

  public recordDecision(chosen: Scenario, other: Scenario) {
    this.history.push({ chosenScenario: chosen, otherScenario: other });
    this.currentRound++;
  }

  public isFinished(): boolean {
    return this.currentRound >= this.TOTAL_ROUNDS;
  }

  public calculateResults() {
    let savedHumans = 0;
    let savedAnimals = 0;
    let savedYoung = 0;
    let savedOld = 0;
    let savedLegal = 0;
    let savedFemale = 0;
    let savedMale = 0;

    this.history.forEach(d => {
        d.chosenScenario.entities.forEach(e => {
            const data = ENTITIES[e.type];
            if (data.isHuman) savedHumans++;
            else savedAnimals++;
            
            if (data.isYoung) savedYoung++;
            if (data.isOld) savedOld++;
            if (data.isFemale) savedFemale++;
            if (data.isMale) savedMale++;
        });

        if (d.chosenScenario.legality === 'LEGAL') savedLegal++;
    });

    const totalDecisions = this.history.length;
    
    return {
        savedHumans,
        savedAnimals,
        savedYoung,
        savedOld,
        savedLegal,
        savedFemale,
        savedMale,
        totalHumans: this.getTotalCount('isHuman'),
        totalAnimals: this.getTotalCount('isAnimal'),
        totalYoung: this.getTotalCount('isYoung'),
        totalOld: this.getTotalCount('isOld'),
        totalFemale: this.getTotalCount('isFemale'),
        totalMale: this.getTotalCount('isMale'),
        totalDecisions,
        history: [...this.history]
    };
  }

  private getTotalCount(key: string): number {
    let count = 0;
    this.history.forEach(d => {
        [d.chosenScenario, d.otherScenario].forEach(s => {
            s.entities.forEach(e => {
                const data = ENTITIES[e.type] as any;
                if (key === 'isHuman' && data.isHuman) count++;
                if (key === 'isAnimal' && !data.isHuman) count++;
                if (key === 'isYoung' && data.isYoung) count++;
                if (key === 'isOld' && data.isOld) count++;
                if (key === 'isFemale' && data.isFemale) count++;
                if (key === 'isMale' && data.isMale) count++;
            });
        });
    });
    return count;
  }

  public reset() {
    this.history = [];
    this.currentRound = 0;
  }
}
