export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateAge = (age: number): boolean => {
  return age >= 3 && age <= 18;
};

export const validateTime = (time: string): boolean => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const validateTimeRange = (start: string, end: string): boolean => {
  return start < end;
};
