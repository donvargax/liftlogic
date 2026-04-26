type WorkoutExerciseTemplate = {
  id: string;
  name: string;
  tag?: string;
};

type WorkoutDayTemplate = {
  id: string;
  title: string;
  subtitle: string;
  exercises: WorkoutExerciseTemplate[];
};

type WorkoutExercise = WorkoutExerciseTemplate & {
  weight: string;
  sets: string;
  reps: string;
  completed: boolean;
};

type WorkoutDay = {
  id: string;
  title: string;
  subtitle: string;
  exercises: WorkoutExercise[];
};

type WorkoutState = {
  activeDayIndex: number;
  days: WorkoutDay[];
};

const WORKOUT_STORAGE_KEY = 'liftlogic-workout-tracker';

const WORKOUT_TEMPLATE: WorkoutDayTemplate[] = [
  {
    id: 'day-1',
    title: 'Day 1',
    subtitle: 'Torso A',
    exercises: [
      { id: 'incline-barbell-press', name: 'Incline Barbell Press' },
      { id: 'machine-pulldowns-wide-grip', name: 'Machine Pulldowns (Wide Grip)' },
      { id: 'machine-shoulder-press', name: 'Machine Shoulder Press' },
      { id: 'seated-cable-row', name: 'Seated Cable Row' },
      { id: 'triceps-pushdown-myo', name: 'Triceps Pushdown [Myo-reps]' },
    ],
  },
  {
    id: 'day-2',
    title: 'Day 2',
    subtitle: 'Legs A & Core',
    exercises: [
      { id: 'hack-squat', name: 'Hack Squat' },
      { id: 'barbell-deadlift', name: 'Barbell Deadlift' },
      { id: 'leg-extensions-myo', name: 'Leg Extensions [Myo-reps]' },
      { id: 'seated-leg-curl-myo-a', name: 'Seated Leg Curl [Myo-reps]' },
      { id: 'calf-raises-myo-a', name: 'Calf Raises [Myo-reps]', tag: 'Superset' },
      { id: 'kneeling-cable-crunch-a', name: 'Kneeling Cable Crunch', tag: 'Superset' },
    ],
  },
  {
    id: 'day-3',
    title: 'Day 3',
    subtitle: 'Torso B',
    exercises: [
      { id: 'seated-cable-row-b', name: 'Seated Cable Row' },
      { id: 'incline-machine-chest-press', name: 'Incline Machine Chest Press' },
      { id: 'lateral-raises-myo', name: 'Lateral Raises [Myo-reps]' },
      { id: 'machine-pulldowns', name: 'Machine Pulldowns' },
      { id: 'bicep-curls-myo', name: 'Bicep Curls [Myo-reps]' },
    ],
  },
  {
    id: 'day-4',
    title: 'Day 4',
    subtitle: 'Legs B & Core',
    exercises: [
      { id: 'dumbbell-lunges', name: 'Dumbbell Lunges' },
      { id: 'seated-leg-curl-myo-b', name: 'Seated Leg Curl [Myo-reps]' },
      { id: 'horizontal-leg-press', name: 'Horizontal Leg Press' },
      { id: 'dumbbell-sumo-squat', name: 'Dumbbell Sumo Squat' },
      { id: 'calf-raises-myo-b', name: 'Calf Raises [Myo-reps]', tag: 'Superset' },
      { id: 'kneeling-cable-crunch-b', name: 'Kneeling Cable Crunch', tag: 'Superset' },
    ],
  },
];

function createDefaultWorkoutState(): WorkoutState {
  return {
    activeDayIndex: 0,
    days: WORKOUT_TEMPLATE.map(day => ({
      id: day.id,
      title: day.title,
      subtitle: day.subtitle,
      exercises: day.exercises.map(exercise => ({
        ...exercise,
        weight: '',
        sets: '',
        reps: '',
        completed: false,
      })),
    })),
  };
}

function cloneWorkoutDay(day: WorkoutDay): WorkoutDay {
  return {
    ...day,
    exercises: day.exercises.map(exercise => ({ ...exercise })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown, key: string): string {
  if (!isRecord(value)) {
    return '';
  }

  const field = value[key];
  if (typeof field === 'number') {
    return `${field}`;
  }

  return typeof field === 'string' ? field : '';
}

function readBoolean(value: unknown, key: string): boolean {
  return isRecord(value) && typeof value[key] === 'boolean' ? value[key] : false;
}

function sanitizeWorkoutState(value: unknown): WorkoutState | null {
  if (!isRecord(value)) {
    return null;
  }

  const defaults = createDefaultWorkoutState();
  const rawDays = Array.isArray(value.days) ? value.days : [];
  const maxIndex = defaults.days.length - 1;
  const rawActiveDayIndex = typeof value.activeDayIndex === 'number'
    ? Math.floor(value.activeDayIndex)
    : defaults.activeDayIndex;

  return {
    activeDayIndex: Math.min(Math.max(rawActiveDayIndex, 0), maxIndex),
    days: defaults.days.map((defaultDay, dayIndex) => {
      const importedDay = rawDays.find(day => isRecord(day) && day.id === defaultDay.id) ?? rawDays[dayIndex];
      const importedExercises = isRecord(importedDay) && Array.isArray(importedDay.exercises)
        ? importedDay.exercises
        : [];

      return {
        ...defaultDay,
        exercises: defaultDay.exercises.map((defaultExercise, exerciseIndex) => {
          const importedExercise = importedExercises.find(
            exercise => isRecord(exercise) && exercise.id === defaultExercise.id,
          ) ?? importedExercises[exerciseIndex];

          return {
            ...defaultExercise,
            weight: readString(importedExercise, 'weight'),
            sets: readString(importedExercise, 'sets'),
            reps: readString(importedExercise, 'reps'),
            completed: readBoolean(importedExercise, 'completed'),
          };
        }),
      };
    }),
  };
}

export class App {
  currentWeight: number = 0;
  oneRM: number = 0;
  tenRM: number = 0;
  twentyRM: number = 0;
  thirtyRM: number = 0;
  activeDayIndex: number = 0;
  workoutDays: WorkoutDay[] = [];
  workoutDayDrafts: WorkoutDay[] = [];
  dirtyDayIds: string[] = [];
  backupPromptOpen = false;
  backupPromptDayTitle = '';
  statusMessage = '';
  statusTone: 'success' | 'error' | '' = '';
  importInput?: HTMLInputElement;
  backupDialog?: HTMLDivElement;
  backupPrimaryAction?: HTMLButtonElement;

  readonly FIRST_WARMUP_REPS = 12;
  readonly SECOND_WARMUP_REPS = 8;
  readonly THIRD_WARMUP_REPS = 4;
  readonly BRZYCKI_COEFFICIENT = 36;

  constructor() {
    this.applyWorkoutState(this.loadWorkoutState());
  }

  get activeDay(): WorkoutDay {
    return this.workoutDays[this.activeDayIndex] ?? this.workoutDays[0];
  }

  get activeDayDraft(): WorkoutDay {
    return this.workoutDayDrafts[this.activeDayIndex] ?? this.workoutDayDrafts[0];
  }

  get activeDayIsDirty(): boolean {
    return this.dirtyDayIds.includes(this.activeDay.id);
  }

  calculateRMs() {
    if (this.currentWeight <= 0) return;

    const assumedReps = 5;
    this.oneRM = this.currentWeight * (1 + assumedReps / this.BRZYCKI_COEFFICIENT);
    this.tenRM = this.oneRM / (1 + 10 / this.BRZYCKI_COEFFICIENT);
    this.twentyRM = this.oneRM / (1 + 20 / this.BRZYCKI_COEFFICIENT);
    this.thirtyRM = this.oneRM / (1 + 30 / this.BRZYCKI_COEFFICIENT);
  }

  roundToPlate(weight: number): number {
    return Math.ceil(weight / 2.5) * 2.5;
  }

  selectDay(index: number) {
    this.activeDayIndex = index;
    this.persistWorkoutState();
  }

  markWorkoutFormDirty(dayId: string = this.activeDay.id) {
    if (!this.dirtyDayIds.includes(dayId)) {
      this.dirtyDayIds = [...this.dirtyDayIds, dayId];
    }
  }

  isDayDirty(day: WorkoutDay): boolean {
    return this.dirtyDayIds.includes(day.id);
  }

  saveWorkoutForm(showStatus: boolean = true): boolean {
    this.commitDraftForDay(this.activeDayIndex);
    const persisted = this.persistWorkoutState();

    if (persisted) {
      this.clearDirtyDay(this.activeDay.id);
      if (showStatus) {
        this.statusMessage = 'Workout data saved locally.';
        this.statusTone = 'success';
      }
    }

    return persisted;
  }

  submitWorkoutForm(event: Event) {
    event.preventDefault();
    this.saveWorkoutForm();
  }

  persistWorkoutState(): boolean {
    if (typeof localStorage === 'undefined') {
      return true;
    }

    try {
      localStorage.setItem(
        WORKOUT_STORAGE_KEY,
        JSON.stringify({
          activeDayIndex: this.activeDayIndex,
          days: this.workoutDays,
        }),
      );
      return true;
    } catch {
      this.statusMessage = 'Could not save workout data locally.';
      this.statusTone = 'error';
      return false;
    }
  }

  handleCompletionChange() {
    this.saveWorkoutForm(false);

    if (this.isDayComplete(this.activeDay)) {
      this.openBackupPrompt(this.activeDay.title);
    }
  }

  finishRoutine() {
    this.saveWorkoutForm(false);
    this.openBackupPrompt(this.activeDay.title);
  }

  getCompletedExerciseCount(day: WorkoutDay): number {
    return day.exercises.filter(exercise => exercise.completed).length;
  }

  isDayComplete(day: WorkoutDay): boolean {
    return day.exercises.length > 0 && day.exercises.every(exercise => exercise.completed);
  }

  serializeWorkoutData(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        workoutState: {
          activeDayIndex: this.activeDayIndex,
          days: this.workoutDays,
        },
      },
      null,
      2,
    );
  }

  exportData(filename: string = 'liftlogic-workout-data.json'): string {
    if (this.isDayDirty(this.activeDay)) {
      this.saveWorkoutForm(false);
    }

    const data = this.serializeWorkoutData();

    if (typeof document !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    this.statusMessage = 'Workout data exported.';
    this.statusTone = 'success';
    return data;
  }

  exportBackupAndClose() {
    this.exportData();
    this.dismissBackupPrompt();
  }

  openImportPicker() {
    this.importInput?.click();
  }

  async importData(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    const contents = await file.text();
    this.importWorkoutData(contents);

    if (input) {
      input.value = '';
    }
  }

  importWorkoutData(serialized: string): boolean {
    try {
      const parsed = JSON.parse(serialized) as unknown;
      const payload = isRecord(parsed) && 'workoutState' in parsed ? parsed.workoutState : parsed;
      const nextState = sanitizeWorkoutState(payload);

      if (!nextState) {
        throw new Error('Invalid backup file');
      }

      this.applyWorkoutState(nextState);
      this.persistWorkoutState();
      this.statusMessage = 'Workout data imported.';
      this.statusTone = 'success';
      return true;
    } catch {
      this.statusMessage = 'Could not import that backup file.';
      this.statusTone = 'error';
      return false;
    }
  }

  dismissBackupPrompt() {
    this.backupPromptOpen = false;
    this.backupPromptDayTitle = '';
  }

  private applyWorkoutState(state: WorkoutState) {
    this.activeDayIndex = state.activeDayIndex;
    this.workoutDays = state.days;
    this.workoutDayDrafts = state.days.map(day => cloneWorkoutDay(day));
    this.dirtyDayIds = [];
  }

  private loadWorkoutState(): WorkoutState {
    if (typeof localStorage === 'undefined') {
      return createDefaultWorkoutState();
    }

    try {
      const savedState = localStorage.getItem(WORKOUT_STORAGE_KEY);
      if (!savedState) {
        return createDefaultWorkoutState();
      }

      return sanitizeWorkoutState(JSON.parse(savedState)) ?? createDefaultWorkoutState();
    } catch {
      return createDefaultWorkoutState();
    }
  }

  private openBackupPrompt(dayTitle: string) {
    this.backupPromptDayTitle = dayTitle;
    this.backupPromptOpen = true;
    this.focusBackupPrompt();
  }

  private commitDraftForDay(dayIndex: number) {
    const savedDay = this.workoutDays[dayIndex];
    const draftDay = this.workoutDayDrafts[dayIndex];

    if (!savedDay || !draftDay) {
      return;
    }

    this.workoutDays[dayIndex] = {
      ...savedDay,
      exercises: savedDay.exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        weight: draftDay.exercises[exerciseIndex]?.weight ?? '',
        sets: draftDay.exercises[exerciseIndex]?.sets ?? '',
        reps: draftDay.exercises[exerciseIndex]?.reps ?? '',
        completed: draftDay.exercises[exerciseIndex]?.completed ?? false,
      })),
    };
    this.workoutDayDrafts[dayIndex] = cloneWorkoutDay(this.workoutDays[dayIndex]);
  }

  private clearDirtyDay(dayId: string) {
    this.dirtyDayIds = this.dirtyDayIds.filter(id => id !== dayId);
  }

  private focusBackupPrompt() {
    if (typeof document === 'undefined') {
      return;
    }

    const focusTarget = () => {
      this.backupPrimaryAction?.focus();
      if (document.activeElement !== this.backupPrimaryAction) {
        this.backupDialog?.focus();
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(focusTarget);
    } else {
      setTimeout(focusTarget, 0);
    }
  }
}
