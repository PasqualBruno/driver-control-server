export interface ITransactionCreateDTO {
  vehicleId: string;
  type: TransactionType;
  category: CategoryType;
  amount: number;
  description?: string;
  date: Date;
  kmAtTime?: number;
  status: TransactionStatus;
}

export enum TransactionStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
}

enum TransactionType {
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
