/**
 * Service categories supported by BlihOps
 */
export enum ServiceCategory {
  ITO = 'ITO',
  AI = 'AI',
  AUTOMATION = 'AUTOMATION',
  DATA_ANALYTICS = 'DATA_ANALYTICS',
}

/**
 * Service category display names
 */
export const ServiceCategoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.ITO]: 'Information Technology Outsourcing',
  [ServiceCategory.AI]: 'AI & Intelligent Solutions',
  [ServiceCategory.AUTOMATION]: 'Business Automation Services',
  [ServiceCategory.DATA_ANALYTICS]: 'Data & Analytics Services',
};





