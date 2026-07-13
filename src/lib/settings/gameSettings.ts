// Gameplay tuning constants.

// layout (px)
export const HEADER_HEIGHT = 52;
export const GROUND_HEIGHT = 100;

// sprite sizes, as a percentage of window height
export const DONUT_SIZE_FACTOR = 6;
export const SHOOTER_SIZE_FACTOR = 1.5;

// speed & timing
export const DONUT_FALL_SPEED = 0.5; // pixels per millisecond
export const TIME_BETWEEN_DONUTS = 3200; // ms between donut drops
export const TIME_BEFORE_HIT_DONUT_TURNS_TO_SMOKE = 200; // ms
export const TIME_BEFORE_HIT_DONUT_DISAPPEARS = 200; // ms
export const TIME_BEFORE_MISSED_DONUT_DISAPPEARS = 200; // ms
export const BULLET_HIT_DELAY = 100; // ms between the shot and the hit registering
export const BULLET_FLIGHT_DURATION = 300; // ms for a bullet to leave the screen

// rules
export const MAX_HEALTH = 3;
export const MAX_MISSES = 3;

// colors
export const GAME_BACKGROUND_COLOR = "#233343";
export const HEADER_BACKGROUND_COLOR = "#394856";
