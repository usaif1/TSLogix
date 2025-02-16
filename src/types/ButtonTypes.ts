export enum ButtonBgColorsEnum {
  blue = "bg-blue-600",
  salwaGolden = "bg-salwa-gold",
  green = "bg-emerald-700",
}

export enum ButtonTextColorsEnum {
  white = "text-white",
}

export type ButtonBgColors = keyof typeof ButtonBgColorsEnum;

export type ButtonTextColors = keyof typeof ButtonTextColorsEnum;
