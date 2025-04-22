export class App {
  currentWeight: number = 0;
  oneRM: number = 0;
  tenRM: number = 0;
  twentyRM: number = 0;
  thirtyRM: number = 0;
  
  // Constants for warm-up set reps
  readonly FIRST_WARMUP_REPS = 12;
  readonly SECOND_WARMUP_REPS = 8;
  readonly THIRD_WARMUP_REPS = 4;
  
  // Brzycki formula coefficients
  readonly BRZYCKI_COEFFICIENT = 36;

  calculateRMs() {
    if (this.currentWeight <= 0) return;
    
    // Calculate 1RM using the reverse Brzycki formula
    // For working set, we assume this is close to the person's 5RM
    const assumedReps = 5;
    this.oneRM = this.currentWeight * (1 + assumedReps / this.BRZYCKI_COEFFICIENT);
    
    // Calculate target RMs for warm-up sets
    // These formulas are based on the relationship between 1RM and various rep maxes
    this.tenRM = this.oneRM / (1 + 10 / this.BRZYCKI_COEFFICIENT);
    this.twentyRM = this.oneRM / (1 + 20 / this.BRZYCKI_COEFFICIENT);
    this.thirtyRM = this.oneRM / (1 + 30 / this.BRZYCKI_COEFFICIENT);
  }
  
  // Helper function to round weight to nearest 2.5 (for plate calculations)
  // For weights like 103.7, we round to 105 (ceiling to nearest 2.5)
  roundToPlate(weight: number): number {
    return Math.ceil(weight / 2.5) * 2.5;
  }
}
