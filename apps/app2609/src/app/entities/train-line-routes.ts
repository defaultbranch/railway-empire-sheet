import { slugify } from '../slug';
import type { ContinuousTrainLine } from '../game-state/types';

export function trainLineSlug(trainLine: Pick<ContinuousTrainLine, 'name'>): string {
  return slugify(trainLine.name);
}

export function pathForTrainLine(trainLine: Pick<ContinuousTrainLine, 'name'>): string {
  return `/train-lines/${trainLineSlug(trainLine)}`;
}
