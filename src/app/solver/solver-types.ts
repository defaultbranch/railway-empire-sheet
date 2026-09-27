import type { Good, IndustrySlot } from '../game-state/types';

// The solver works on a flattened, pre-resolved view of the game state: levels have already been
// looked up in production tables and recipes, hosts have been attributed to their stops, and lines
// have been unrolled into directed legs. Every amount in this file is a rate in units per week.

// a stop in the graph; string-keyable so flows can live in plain maps
export type NodeId = `station:${string}` | `warehouse:${string}`;

// one directed leg of a line, identified by the line name and the leg's direction (0: first stop
// to second, 1: back); only two-stop lines are modelled
export type LegId = `${string}@${0 | 1}`;

// the game-state entity a source or sink amount belongs to, so results can be read back per entity
export type Contributor =
  | { kind: 'rural business'; name: string }
  | { kind: 'industry'; city: string; slot: IndustrySlot }
  | { kind: 'population'; city: string };

// a contributor's own weekly volume of one good, before the network constrains it
export type Contribution = {
  contributor: Contributor;
  good: Good;
  amount: number;
};

// an industry at a node: output is not fixed but a constant-ratio function of delivered input
export type Conversion = {
  contributor: Contributor;
  // weekly raw material need and product capacity at the industry's current level
  rawMaterials: { good: Good; amount: number }[];
  products: { good: Good; amount: number }[];
};

export type FlowNode = {
  id: NodeId;
  // what a train may drop off here: a warehouse's stocking list, or, for a station hosting a city,
  // that city's active population demands plus its industries' raw materials; empty for a station
  // hosting rural businesses. Gates hosted sinks and transshipment alike, by good, never by volume
  unloadableGoods: Set<Good>;
  // what a train may pick up here: a warehouse's stocking list, or, for a station, whatever its
  // host produces on top of the unloadable goods
  loadableGoods: Set<Good>;
  // rural business production hosted here
  sources: Contribution[];
  // population demand hosted here
  sinks: Contribution[];
  // hosted industries, both sink (raw materials) and source (products)
  conversions: Conversion[];
};

export type Leg = {
  id: LegId;
  line: string;
  from: NodeId;
  to: NodeId;
  // weekly units shared across all goods: trains * 8 * 7 / tourDays
  capacity: number;
};

// the compiled problem; lines are absent, and warned about, when they have more than two stops, an
// unknown tourDays, or carry only mail and passengers
export type FlowNetwork = {
  goods: Good[];
  nodes: FlowNode[];
  legs: Leg[];
};

// a coefficient the player has not discovered yet, dropped from the problem rather than assumed zero
export type MissingCoefficient = {
  // the rural business type or industry type whose table has the gap
  typeName: string;
  good: Good | undefined;
  level: number;
};

export type LegFlow = {
  leg: LegId;
  good: Good;
  units: number;
};

// weekly turn-over of one good at one node, split by direction
export type NodeFlow = {
  node: NodeId;
  good: Good;
  loaded: number;
  unloaded: number;
};

// how much of a single contributor's own volume the network actually shipped out or delivered;
// `served / requested` is the fulfilment fraction shown per business, industry and city
export type ContributorFlow = {
  contributor: Contributor;
  node: NodeId;
  good: Good;
  requested: number;
  served: number;
};

export type SolveOptions = {
  // share of each iteration's new estimate blended into the running one, in (0, 1]
  damping: number;
  // largest per-flow change accepted as converged
  tolerance: number;
  maxIterations: number;
};

export type FlowSolution = {
  legFlows: LegFlow[];
  nodeFlows: NodeFlow[];
  contributorFlows: ContributorFlow[];
  iterations: number;
  converged: boolean;
  missingCoefficients: MissingCoefficient[];
};
