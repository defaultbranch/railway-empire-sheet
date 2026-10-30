declare module 'd3-sankey-circular' {
  export type SankeyNode<Node> = Node & {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    depth: number;
    value: number;
    sourceLinks: unknown[];
    targetLinks: unknown[];
  };
  export type SankeyLink<Node, Link> = Omit<Link, 'source' | 'target'> & {
    source: SankeyNode<Node>;
    target: SankeyNode<Node>;
    width: number;
    y0: number;
    y1: number;
    path: string;
  };
  type SankeyLayout<Node, Link> = {
    (graph: { nodes: Node[]; links: Link[] }): {
      nodes: SankeyNode<Node>[];
      links: SankeyLink<Node, Link>[];
    };
    nodeId(accessor: (node: Node) => string): SankeyLayout<Node, Link>;
    nodeWidth(width: number): SankeyLayout<Node, Link>;
    nodePadding(padding: number): SankeyLayout<Node, Link>;
    nodeAlign(accessor: (node: SankeyNode<Node>, columns: number) => number): SankeyLayout<Node, Link>;
    extent(extent: [[number, number], [number, number]]): SankeyLayout<Node, Link>;
  };
  export function sankeyCircular<Node, Link>(): SankeyLayout<Node, Link>;
}
