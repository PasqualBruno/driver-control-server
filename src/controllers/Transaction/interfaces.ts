export interface ITransactionCreateDTO {
  type: TransactionType;
  category: CategoryType;
  status: TransactionStatus;
  transactionNature: TransactionNature;
  amount: number;

  description?: string;
  date: Date;
  kmAtTime?: number;
  shiftId?: string;
}

export enum TransactionNature {
  WORK = "WORK",
  PERSONAL = "PERSONAL",
}

export enum TransactionStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum MaintenanceStatus {
  OK = "OK",
  WARNING = "WARNING",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
}

export enum CategoryType {
  RIDE_EARNING = "RIDE_EARNING",
  FUEL = "FUEL",
  MAINTENANCE = "MAINTENANCE",
  FOOD = "FOOD",
  INSURANCE = "INSURANCE",
  TAX = "TAX",
  OTHER = "OTHER",
}

export interface ITransactionCreateSearchParams {
  day?: string;
  month?: string;
  year?: string;
  vehicleId?: string;
}
