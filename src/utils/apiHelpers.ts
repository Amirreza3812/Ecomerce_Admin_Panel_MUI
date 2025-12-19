// src/utils/apiHelpers.ts

export const getChangedFields = <T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> => {
  const changed: Partial<T> = {};
  
  for (const key in updated) {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      changed[key] = updated[key];
    }
  }
  
  return changed;
};