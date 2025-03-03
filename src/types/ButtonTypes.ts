// btn variant
export enum ButtonVariantEnum {
  primary = "bg-primary-500 hover:bg-primary-600 text-white",
  action = "bg-action-nav hover:bg-[#0F2F47] text-white",
  cancel = "bg-cancel-nav hover:bg-red-500 hover:text-white text-red-500 border border-red-500",
}

export type ButtonVariant = keyof typeof ButtonVariantEnum;
