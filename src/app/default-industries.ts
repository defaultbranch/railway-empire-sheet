import type { Industry } from './game-state/types';
import type { DefaultIndustryTypeName } from './default-industry-types';
import type { DefaultCityName } from './default-cities';

type DefaultIndustry = Omit<Industry, 'typeName' | 'city'> & {
  typeName: DefaultIndustryTypeName;
  city: DefaultCityName;
};

export const defaultIndustries: readonly DefaultIndustry[] = [
] as const;
