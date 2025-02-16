// btn variant
export enum ButtonVariantEnum {
  primary = "bg-primary-500 hover:bg-primary-600 text-white cursor-pointer",
}
export type ButtonVariant = keyof typeof ButtonVariantEnum;
