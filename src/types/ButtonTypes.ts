// btn variant
export enum ButtonVariantEnum {
  primary = "bg-primary-500 hover:bg-primary-600 text-white",
  action = "bg-action-nav hover:bg-[#0F2F47] text-white",
}
export type ButtonVariant = keyof typeof ButtonVariantEnum;
