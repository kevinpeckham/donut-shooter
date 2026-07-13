// Gameplay tuning constants.

// layout (px)
export const HEADER_HEIGHT = 52;
export const GROUND_HEIGHT = 100;

// sprite sizes, as a percentage of window height
export const DONUT_SIZE_FACTOR = 6;
export const SHOOTER_SIZE_FACTOR = 1.5;
export const BULLET_MIN_SCALE = 0.5; // bullet size at the top of its flight, relative to launch size

// speed & timing
export const INITIAL_DROP_DELAY = 1250; // ms after the game starts before the first donut drops
export const DONUT_FALL_SPEED = 0.5; // pixels per millisecond
export const TIME_BETWEEN_DONUTS = 3200; // ms between donut drops
export const TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE = 200; // ms after the bullet connects
export const TIME_BEFORE_HIT_DONUT_DISAPPEARS = 200; // ms after turning to smoke
export const TIME_BEFORE_MISSED_DONUT_DISAPPEARS = 200; // ms
export const BULLET_FLIGHT_DURATION = 300; // ms for a bullet to leave the screen

// rules
export const MAX_HEALTH = 3;
export const MAX_MISSES = 3;

// levels
export const HITS_PER_LEVEL = 10; // hits needed to complete a level
export const MAX_LEVEL = 20; // completing this level wins the game
export const LEVEL_SPEEDUP_FACTOR = 0.95; // per-level multiplier on fall duration and drop interval
export const DROP_INTERVAL_JITTER = 0.25; // ± fraction of randomness in the time between drops
export const LEVEL_BANNER_DURATION = 1500; // ms the "Level N" banner stays up

// colors
export const GAME_BACKGROUND_COLOR = "#233343";
export const HEADER_BACKGROUND_COLOR = "#394856";
