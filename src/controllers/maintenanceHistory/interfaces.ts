export interface IMaintenanceHistoryCreateDTO {
  maintenanceId: string;
  paidPrice: number;
  informedKm: number;
  mechanicShopName?: string;
  observation?: string;
}
