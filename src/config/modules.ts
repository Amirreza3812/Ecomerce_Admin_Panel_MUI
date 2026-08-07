// This is a temporary file for development.
// When your super_admin backend is ready, you can delete this file
// and update ModuleContext.tsx to fetch from the API.

import { defaultLicenseConfig } from "./license";

/** @deprecated prefer useLicense().modules — kept for compatibility */
export const modulesConfig = {
  ...defaultLicenseConfig.modules,
};


// export const modulesConfig = {
//   orders: true,
//   categories: true,
//   products: true,
//   banking: true,
//   personnel: true,
//   prices: true,
//   customers: true,
//   comments: true,
//   settings: true,
//   about: true,
//   feedback: true,
//   subcategories: true,
//   myAccount: true,
// };
