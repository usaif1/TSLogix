// DST
export type DSRTabs = "sales" | "denomination";

export type SalesFormState = {
  net_sale: number;
  opening_balance: number;
  total_balance: number;
  online_sale: number;
  account_transfer: number;
  credit_bill: number;
  total_expenses: number;
  cash_report: number;
};

export type DenominationFormState = {
  five_hundred: number;
  two_hundred: number;
  one_hundred: number;
  fifty: number;
  twenty_note: number;
  ten_note: number;
  twenty_coin: number;
  ten_coin: number;
  five_coin: number;
  two_coin: number;
  one_coin: number;
  total: number;
};

export type DSR = {
  denomination: DenominationFormState;
  sales_data: SalesFormState;
  cash_variance: number;
  created_on: string;
  id: string;
  name: string;
  created_by: string;
  created_by_name: string;
};
