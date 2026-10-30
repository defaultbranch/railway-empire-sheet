import { slugify } from '../slug';
import type { TrainLine } from '../game-state/types';

export function trainLineSlug(trainLine: Pick<TrainLine, 'name'>): string {
  return slugify(trainLine.name);
}

export function pathForTrainLine(trainLine: Pick<TrainLine, 'name'>): string {
  return `/train-lines/${trainLineSlug(trainLine)}`;
}
