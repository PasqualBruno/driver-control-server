export interface CreateMaintenanceDTO {
  vehicleId: string;
  itemName: string;
  controlBy: MaintenanceControl;
  controlValue: number;
  lastChangedDate?: string | Date;
  nextChangeDate?: string | Date;
  lastChangedKm?: number;
  nextChangeKm?: number;
  cost?: number;
  status?: MaintenanceStatus;
}

export interface UpdateMaintenanceDTO extends Partial<CreateMaintenanceDTO> {}

export enum MaintenanceControl {
  KM = "KM",
  TIME = "TIME",
}

export enum MaintenanceStatus {
  OK = "OK",
  WARNING = "WARNING",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
}
