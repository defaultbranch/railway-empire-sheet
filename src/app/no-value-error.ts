export const noValueError
  : (message?: string) => never
  = (message) => { throw new Error(message ?? 'no value'); }
