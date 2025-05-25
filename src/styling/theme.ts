export enum COLOR_PALETTE {
  BLACK = "#000000",
  LIGHT_BLACK = "#1C1C1C",
  WHITE = "#EDEDED",
  YELLOW = "#FFDD55",
  GOLD = "#C9A73B",
  BEIGE = "#F5F0E1",
  LIGHT_GRAY = "#787878",
  PLACEHOLDER_COLOR = "#909090",
  DISABLED = "#7d7878",
}

// text color
export type TEXT_COLORS =
  | "text-black"
  | "text-light-black"
  | "text-white"
  | "text-beige"
  | "text-gold"
  | "text-light-gray"
  | "text-placeholder-text"
  | "text-yellow";

// text size
export enum TEXT_SIZE_ENUM {
  xxs = "text-xxs",
  xs = "text-xs",
  sm = "text-sm",
  base = "text-base",
  lg = "text-lg",
  xl = "text-xl",
  "2xl" = "text-2xl",
  "3xl" = "text-3xl",
}

export type TEXT_SIZE = keyof typeof TEXT_SIZE_ENUM;

// text weight
export enum FONT_WEIGHT_ENUM {
  "light" = 300,
  "normal" = 400,
  "medium" = 500,
  "bold" = 600,
  "extrabold" = 700,
}

export type FONT_WEIGHT = 
  | "font-thin"
  | "font-extralight" 
  | "font-light"
  | "font-normal"
  | "font-medium"
  | "font-semibold"
  | "font-bold"
  | "font-extrabold"
  | "font-black"
  | "normal";
