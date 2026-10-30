import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let buildWarehouseFlowDiagram;
let buildGoodsFlowDiagram;
let buildIndustryFlowDiagram;
let buildCityGoodFlowDiagram;
let buildRuralBusinessFlowDiagram;
let layoutGoodsFlow;
let FlowSankey;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ buildWarehouseFlowDiagram, buildGoodsFlowDiagram, buildIndustryFlowDiagram, buildCityGoodFlowDiagram, buildRuralBusinessFlowDiagram } = await server.ssrLoadModule('/src/app/pages/goods-flow.ts'));
  ({ layoutGoodsFlow } = await server.ssrLoadModule('/src/app/pages/goods-flow-layout.ts'));
  ({ FlowSankey } = await server.ssrLoadModule('/src/app/pages/goods-flow-page.tsx'));
});
after(async () => { await server?.close(); });

function fixture() {
  const node = (id) => ({ id, sources: [], sinks: [], conversions: [],
    loadableGoods: new Set(['Wheat', 'Corn']), unloadableGoods: new Set(['Wheat', 'Corn']) });
  const network = {
    goods: ['Wheat', 'Corn'],
    nodes: ['warehouse:Hub', 'warehouse:Before', 'warehouse:After', 'station:Beyond'].map(node),
    legs: [
      { id: 'in@0', from: 'warehouse:Before', to: 'warehouse:Hub' },
      { id: 'in@1', from: 'warehouse:Hub', to: 'warehouse:Before' },
      { id: 'parallel@0', from: 'warehouse:Before', to: 'warehouse:Hub' },
      { id: 'out@0', from: 'warehouse:Hub', to: 'warehouse:After' },
      { id: 'beyond@0', from: 'warehouse:After', to: 'station:Beyond' },
    ].map((leg) => ({ ...leg, line: leg.id, capacity: 10 })),
  };
  const solution = { legFlows: [
    { leg: 'in@0', good: 'Wheat', units: 4 }, { leg: 'in@1', good: 'Wheat', units: 2 },
    { leg: 'parallel@0', good: 'Wheat', units: 1 }, { leg: 'out@0', good: 'Wheat', units: 3 },
    { leg: 'in@0', good: 'Corn', units: 2 }, { leg: 'out@0', good: 'Corn', units: 2 },
    { leg: 'beyond@0', good: 'Wheat', units: 3 },
  ], contributorFlows: [], nodeFlows: [], converged: true, iterations: 1, missingCoefficients: [] };
  return { network, solution };
}

test('industry diagrams trace all upstream sources and downstream sinks over multiple hops', () => {
  const { network, solution } = fixture();
  const industry = { kind: 'industry', city: 'Town', slot: 0 };
  const otherIndustry = { kind: 'industry', city: 'Town', slot: 1 };
  const farm = { kind: 'rural business', name: 'Farm' };
  const localFarm = { kind: 'rural business', name: 'Local farm' };
  const population = { kind: 'population', city: 'Beyond' };
  const hub = network.nodes[0];
  hub.conversions.push({ contributor: industry, rawMaterials: [{ good: 'Wheat', amount: 5 }],
    products: [{ good: 'Corn', amount: 4 }] });
  hub.conversions.push({ contributor: otherIndustry, rawMaterials: [{ good: 'Wheat', amount: 2 }], products: [] });
  network.nodes[1].sources.push({ contributor: farm, good: 'Wheat', amount: 6 });
  hub.sources.push({ contributor: localFarm, good: 'Wheat', amount: 1 });
  network.nodes[3].sinks.push({ contributor: population, good: 'Corn', amount: 4 });
  solution.contributorFlows = [
    { contributor: farm, node: network.nodes[1].id, good: 'Wheat', requested: 6, served: 4 },
    { contributor: localFarm, node: hub.id, good: 'Wheat', requested: 1, served: 1 },
    { contributor: industry, node: hub.id, good: 'Wheat', requested: 5, served: 3 },
    { contributor: otherIndustry, node: hub.id, good: 'Wheat', requested: 2, served: 2 },
    { contributor: industry, node: hub.id, good: 'Corn', requested: 4, served: 4 },
    { contributor: population, node: network.nodes[3].id, good: 'Corn', requested: 4, served: 4 },
  ];
  solution.legFlows = [{ leg: 'in@0', good: 'Wheat', units: 4 },
    { leg: 'out@0', good: 'Corn', units: 4 }, { leg: 'beyond@0', good: 'Corn', units: 4 }];
  const before = JSON.stringify({ network, solution });
  const inbound = buildIndustryFlowDiagram(network, solution, industry, 'in');
  assert.equal(inbound.links.length, 4);
  assert.deepEqual(inbound.nodes.filter((node) => node.role === 'producer').map((node) => node.label), ['Farm', 'Local farm']);
  assert.equal(inbound.nodes.filter((node) => node.role === 'consumer').length, 1);
  assert.ok(inbound.links.every((link) => link.good === 'Wheat'));
  const outbound = buildIndustryFlowDiagram(network, solution, industry, 'out');
  assert.equal(outbound.links.length, 4);
  assert.ok(outbound.nodes.some((node) => node.label === 'Beyond population'));
  assert.ok(outbound.nodes.every((node) => !node.label.includes('Farm')));
  assert.ok(outbound.links.every((link) => link.good === 'Corn'));
  assert.equal(inbound.nodes.find((node) => node.label === 'Town industry 1').path,
    '/pages/18-industry-supply-chain?city=Town&slot=1');
  assert.equal(outbound.nodes.find((node) => node.label === 'Town industry 1').path,
    '/pages/18-industry-supply-chain?city=Town&slot=1');
  assert.equal(outbound.nodes.find((node) => node.label === 'Beyond population').path, '/cities/beyond');
  for (const diagram of [inbound, outbound]) {
    const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 500);
    assert.ok(graph.links.every((link) => !link.path.includes('NaN')));
  }
  assert.equal(JSON.stringify({ network, solution }), before);
  assert.deepEqual(buildIndustryFlowDiagram(network, solution, { ...industry, slot: 2 }, 'in'), { nodes: [], links: [] });
});

test('city good supply traces net upstream flows to separate population and industry sinks', () => {
  const { network, solution } = fixture();
  const farm = { kind: 'rural business', name: 'Farm' };
  const population = { kind: 'population', city: 'Town' };
  const industry = { kind: 'industry', city: 'Town', slot: 0 };
  const otherCity = { kind: 'population', city: 'Other town' };
  network.nodes[1].sources.push({ contributor: farm, good: 'Wheat', amount: 6 });
  network.nodes[3].sinks.push({ contributor: population, good: 'Wheat', amount: 2 });
  network.nodes[3].sinks.push({ contributor: otherCity, good: 'Wheat', amount: 1 });
  network.nodes[3].conversions.push({ contributor: industry,
    rawMaterials: [{ good: 'Wheat', amount: 1 }], products: [{ good: 'Corn', amount: 1 }] });
  solution.contributorFlows = [
    { contributor: farm, node: network.nodes[1].id, good: 'Wheat', requested: 6, served: 3 },
    { contributor: population, node: network.nodes[3].id, good: 'Wheat', requested: 2, served: 2 },
    { contributor: industry, node: network.nodes[3].id, good: 'Wheat', requested: 1, served: 1 },
    { contributor: industry, node: network.nodes[3].id, good: 'Corn', requested: 1, served: 1 },
    { contributor: otherCity, node: network.nodes[3].id, good: 'Wheat', requested: 1, served: 0 },
  ];
  const before = JSON.stringify({ network, solution });
  const diagram = buildCityGoodFlowDiagram(network, solution, 'Town', 'Wheat');
  assert.equal(diagram.links.length, 6);
  assert.deepEqual(diagram.nodes.filter((node) => node.role === 'consumer').map((node) => node.label),
    ['Town population', 'Town industry 1']);
  assert.deepEqual(diagram.nodes.filter((node) => node.role === 'producer').map((node) => node.label), ['Farm']);
  assert.ok(diagram.links.every((link) => link.good === 'Wheat'));
  assert.equal(diagram.links.find((link) => link.source === 'warehouse:Before' && link.target === 'warehouse:Hub').value, 3);
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 500);
  const sinks = graph.nodes.filter((node) => node.role === 'consumer');
  assert.ok(sinks.every((sink) => sink.x0 === Math.max(...graph.nodes.map((node) => node.x0))));
  assert.ok(graph.links.every((link) => link.source.x1 < link.target.x0 && !link.path.includes('NaN')));
  const markup = renderToStaticMarkup(createElement(FlowSankey, {
    diagram, good: 'Wheat', follow: () => {}, showGross: false,
  }));
  assert.ok(markup.includes('Town population') && markup.includes('Town industry 1'));
  assert.ok(!markup.includes('Gross forward'));
  assert.equal(JSON.stringify({ network, solution }), before);
  assert.deepEqual(buildCityGoodFlowDiagram(network, solution, 'Missing', 'Wheat'), { nodes: [], links: [] });
  assert.deepEqual(buildCityGoodFlowDiagram(network, solution, 'Town', 'Corn'), { nodes: [], links: [] });
  solution.legFlows.find((flow) => flow.leg === 'in@1' && flow.good === 'Wheat').units = 5;
  const cancelled = buildCityGoodFlowDiagram(network, solution, 'Town', 'Wheat');
  assert.ok(cancelled.nodes.every((node) => node.label !== 'Farm' && node.id !== 'warehouse:Before'));
});

test('rural business outflow traces local and branching multi-hop sinks without unrelated suppliers', () => {
  const { network, solution } = fixture();
  const farm = { kind: 'rural business', name: 'Farm' };
  const otherFarm = { kind: 'rural business', name: 'Other farm' };
  const local = { kind: 'industry', city: 'Local', slot: 0 };
  const town = { kind: 'population', city: 'Town' };
  const beyond = { kind: 'industry', city: 'Grand Rapids', slot: 1 };
  network.nodes[0].sources.push({ contributor: farm, good: 'Wheat', amount: 8 });
  network.nodes[0].sources.push({ contributor: otherFarm, good: 'Wheat', amount: 2 });
  network.nodes[0].conversions.push({ contributor: local,
    rawMaterials: [{ good: 'Wheat', amount: 1 }], products: [] });
  network.nodes[1].sinks.push({ contributor: town, good: 'Wheat', amount: 2 });
  network.nodes[3].conversions.push({ contributor: beyond,
    rawMaterials: [{ good: 'Wheat', amount: 5 }], products: [] });
  solution.contributorFlows = [
    { contributor: farm, node: network.nodes[0].id, good: 'Wheat', requested: 8, served: 6 },
    { contributor: otherFarm, node: network.nodes[0].id, good: 'Wheat', requested: 2, served: 2 },
    { contributor: local, node: network.nodes[0].id, good: 'Wheat', requested: 1, served: 1 },
    { contributor: town, node: network.nodes[1].id, good: 'Wheat', requested: 2, served: 2 },
    { contributor: beyond, node: network.nodes[3].id, good: 'Wheat', requested: 5, served: 5 },
  ];
  solution.legFlows = [
    { leg: 'in@1', good: 'Wheat', units: 2 },
    { leg: 'out@0', good: 'Wheat', units: 5 },
    { leg: 'beyond@0', good: 'Wheat', units: 5 },
  ];
  const before = JSON.stringify({ network, solution });
  const diagram = buildRuralBusinessFlowDiagram(network, solution, farm);
  assert.equal(diagram.links.length, 7);
  assert.deepEqual(diagram.nodes.filter((node) => node.role === 'producer').map((node) => node.label), ['Farm']);
  assert.deepEqual(diagram.nodes.filter((node) => node.role === 'consumer').map((node) => node.label).sort(),
    ['Grand Rapids industry 2', 'Local industry 1', 'Town population']);
  assert.equal(diagram.nodes.find((node) => node.label === 'Grand Rapids industry 2').path,
    '/pages/18-industry-supply-chain?city=Grand+Rapids&slot=2');
  assert.equal(diagram.nodes.find((node) => node.label === 'Farm').path, '/rural-businesses/farm');
  assert.ok(diagram.links.every((link) => link.good === 'Wheat'));
  assert.equal(diagram.nodes.find((node) => node.label === 'Farm').served, 6);
  assert.equal(diagram.nodes.find((node) => node.label === 'Farm').requested, 8);
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 500);
  assert.ok(graph.links.every((link) => !link.path.includes('NaN')));
  assert.equal(JSON.stringify({ network, solution }), before);
  assert.deepEqual(buildRuralBusinessFlowDiagram(network, solution,
    { kind: 'rural business', name: 'Missing' }), { nodes: [], links: [] });
  solution.contributorFlows = [];
  solution.legFlows = [];
  assert.deepEqual(buildRuralBusinessFlowDiagram(network, solution, farm), { nodes: [], links: [] });
});

test('warehouse view bundles goods and nets opposing and parallel flows within one hop', () => {
  const { network, solution } = fixture();
  const before = JSON.stringify({ network, solution });
  const diagram = buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub');
  assert.equal(diagram.nodes.length, 3);
  assert.deepEqual(diagram.links.map((link) => [link.good, link.value]),
    [['Wheat', 3], ['Wheat', 3], ['Corn', 2], ['Corn', 2]]);
  const center = diagram.nodes.find((node) => node.column === 1);
  assert.equal(center.label, 'Hub');
  assert.equal(center.requested, 5);
  assert.equal(center.served, 5);
  assert.deepEqual(center.segments, [{ good: 'Wheat', incoming: 3, outgoing: 3 },
    { good: 'Corn', incoming: 2, outgoing: 2 }]);
  assert.ok(diagram.nodes.every((node) => node.path.startsWith('/') && node.label !== 'Beyond'));
  assert.equal(JSON.stringify({ network, solution }), before);
});

test('station view includes incoming and outgoing goods with local production and consumption', () => {
  const { network, solution } = fixture();
  const station = network.nodes[0];
  station.id = 'station:Toledo';
  for (const leg of network.legs) {
    if (leg.from === 'warehouse:Hub') leg.from = station.id;
    if (leg.to === 'warehouse:Hub') leg.to = station.id;
  }
  const population = { kind: 'population', city: 'Toledo' };
  const industry = { kind: 'industry', city: 'Toledo', slot: 0 };
  station.sinks.push({ contributor: population, good: 'Wheat', amount: 1 });
  station.conversions.push({ contributor: industry, rawMaterials: [], products: [{ good: 'Corn', amount: 1 }] });
  solution.contributorFlows.push(
    { contributor: population, node: station.id, good: 'Wheat', requested: 1, served: 1 },
    { contributor: industry, node: station.id, good: 'Corn', requested: 1, served: 1 },
  );
  const diagram = buildWarehouseFlowDiagram(network, solution, station.id);
  const center = diagram.nodes.find((node) => node.column === 1);
  assert.equal(center.role, 'station');
  assert.equal(center.path, '/stations/toledo');
  assert.equal(center.requested, 6);
  assert.equal(center.served, 6);
  assert.ok(diagram.nodes.some((node) => node.role === 'producer'));
  assert.ok(diagram.nodes.some((node) => node.role === 'consumer'));
  const markup = renderToStaticMarkup(createElement(FlowSankey, {
    diagram, good: 'Toledo', follow: () => {}, showGross: false,
  }));
  assert.ok(markup.includes('Toledo'));
  assert.ok(!markup.includes('NaN'));
});

test('net ribbons attach inside matching stacked good segments', () => {
  const { network, solution } = fixture();
  const diagram = buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub');
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 360);
  for (const node of graph.nodes) {
    assert.equal(node.value, 5);
    assert.ok(node.y0 - 50 >= graph.top);
    let offset = 0;
    for (const segment of node.segments) {
      const start = node.y0 + (node.y1 - node.y0) * offset / node.value;
      const end = start + (node.y1 - node.y0) * Math.max(segment.incoming, segment.outgoing) / node.value;
      for (const link of graph.links.filter((link) => link.good === segment.good)) {
        const position = link.source === node ? link.y0 : link.target === node ? link.y1 : undefined;
        if (position === undefined) continue;
        assert.ok(position - link.width / 2 >= start - 1e-8);
        assert.ok(position + link.width / 2 <= end + 1e-8);
      }
      offset += Math.max(segment.incoming, segment.outgoing);
    }
  }
  assert.ok(graph.links.every((link) => link.source.x1 < link.target.x0 && !link.path.includes('NaN')));
});

test('one-sided stacks reserve separate space for each good and exact cancellations disappear', () => {
  const { network, solution } = fixture();
  solution.legFlows = [{ leg: 'in@0', good: 'Wheat', units: 3 }, { leg: 'in@1', good: 'Corn', units: 2 }];
  const diagram = buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub');
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 360);
  const center = graph.nodes.find((node) => node.column === 1);
  assert.equal(center.value, 5);
  assert.equal(center.requested, 3);
  assert.equal(center.served, 2);
  solution.legFlows = [{ leg: 'in@0', good: 'Wheat', units: 3 }, { leg: 'in@1', good: 'Wheat', units: 3 }];
  assert.deepEqual(buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub'), { nodes: [], links: [] });
  assert.deepEqual(buildWarehouseFlowDiagram(network, solution, 'warehouse:Missing'), { nodes: [], links: [] });
});

test('rendered warehouse stacks show colored segments, net quantities and navigation links', () => {
  const { network, solution } = fixture();
  const diagram = buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub');
  const markup = renderToStaticMarkup(createElement(FlowSankey, {
    diagram, good: 'Hub', showGross: false, follow: () => {},
  }));
  assert.ok(markup.includes('<svg') && markup.includes('href='));
  assert.ok(markup.includes('Wheat: in 3 / out 3 units/week'));
  assert.ok(markup.includes('Corn: in 2 / out 2 units/week'));
  assert.ok(markup.includes('stroke:#') && markup.includes('fill:#'));
  assert.ok(!markup.includes('Gross'));
  const original = renderToStaticMarkup(createElement(FlowSankey, {
    diagram: buildGoodsFlowDiagram(network, solution, 'Wheat'), good: 'Wheat', follow: () => {},
  }));
  assert.ok(original.includes('Gross forward:'));
});

test('stations carrying multiple goods are bundled once per upstream or downstream endpoint', () => {
  const { network, solution } = fixture();
  const stationId = (id) => id.replace('warehouse:Before', 'station:Before').replace('warehouse:After', 'station:After');
  network.nodes = network.nodes.map((node) => ({ ...node, id: stationId(node.id) }));
  network.legs = network.legs.map((leg) => ({ ...leg, from: stationId(leg.from), to: stationId(leg.to) }));
  const diagram = buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub');
  assert.equal(diagram.nodes.length, 3);
  for (const column of [0, 2]) {
    const adjacent = diagram.nodes.filter((node) => node.column === column);
    assert.equal(adjacent.length, 1);
    assert.equal(adjacent[0].role, 'station');
    assert.deepEqual(adjacent[0].segments.map((segment) => segment.good), ['Wheat', 'Corn']);
    assert.ok(adjacent[0].path.startsWith('/'));
  }
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 360);
  assert.ok(graph.nodes.every((node) => node.value === 5));
});

for (const role of ['producer', 'consumer']) {
  test(`bundled ${role} retains full capacity for each good`, () => {
    const { network, solution } = fixture();
    const contributor = role === 'producer' ? { kind: 'rural business', name: 'Farm' }
      : { kind: 'population', city: 'Town' };
    const contributions = [{ contributor, good: 'Wheat', amount: 6.4 }, { contributor, good: 'Corn', amount: 4 }];
    const hub = network.nodes.find((node) => node.id === 'warehouse:Hub');
    hub[role === 'producer' ? 'sources' : 'sinks'] = contributions;
    solution.contributorFlows = contributions.map((entry, index) => ({ contributor, node: hub.id,
      good: entry.good, requested: entry.amount, served: index === 0 ? 2 : 3 }));
    solution.legFlows = [{ leg: role === 'producer' ? 'out@0' : 'in@0', good: 'Wheat', units: 2 },
      { leg: role === 'producer' ? 'out@0' : 'in@0', good: 'Corn', units: 3 }];
    const diagram = buildWarehouseFlowDiagram(network, solution, hub.id);
    const entities = diagram.nodes.filter((node) => node.role === role);
    assert.equal(entities.length, 1);
    assert.equal(entities[0].requested, 10.4);
    assert.equal(entities[0].served, 5);
    assert.deepEqual(entities[0].segments.map((segment) => segment.capacity), [6.4, 4]);
    const graph = layoutGoodsFlow(diagram.nodes, diagram.links, 360);
    const entity = graph.nodes.find((node) => node.role === role);
    assert.equal(entity.value, 10.4);
    for (const link of graph.links.filter((link) => link.source === entity || link.target === entity)) {
      const position = link.source === entity ? link.y0 : link.y1;
      const offset = link.good === 'Wheat' ? 0 : 6.4;
      const capacity = link.good === 'Wheat' ? 6.4 : 4;
      const top = entity.y0 + (entity.y1 - entity.y0) * offset / entity.value;
      const bottom = top + (entity.y1 - entity.y0) * capacity / entity.value;
      assert.ok(position - link.width / 2 >= top - 1e-8);
      assert.ok(position + link.width / 2 <= bottom + 1e-8);
    }
  });
}

test('each good has a distinct color shared by its ribbons, stacked segments and legend', () => {
  const { network, solution } = fixture();
  network.goods = Array.from({ length: 10 }, (_, index) => `Good ${index}`);
  for (const node of network.nodes) {
    node.loadableGoods = new Set(network.goods);
    node.unloadableGoods = new Set(network.goods);
  }
  solution.legFlows = network.goods.flatMap((good) => [
    { leg: 'in@0', good, units: 1 }, { leg: 'out@0', good, units: 1 },
  ]);
  const diagram = buildWarehouseFlowDiagram(network, solution, 'warehouse:Hub');
  const elements = (element) => Array.isArray(element) ? element.flatMap(elements)
    : element && typeof element === 'object' ? [element, ...elements(element.props?.children)] : [];
  const rendered = elements(FlowSankey({ diagram, good: 'Hub', follow: () => {}, showGross: false }));
  const colors = new Map();
  for (const element of rendered.filter((element) => element.type === 'path')) {
    const good = element.props['data-good'];
    const color = element.props.style.stroke;
    if (colors.has(good)) assert.equal(color, colors.get(good));
    colors.set(good, color);
  }
  assert.equal(colors.size, 10);
  assert.equal(new Set(colors.values()).size, 10);
  for (const element of rendered.filter((element) => element.type === 'rect' && element.props['data-good'])) {
    assert.equal(element.props.style.fill, colors.get(element.props['data-good']));
  }
  const legend = rendered.find((element) => element.type === 'ul' && element.props['aria-label'] === 'Goods color legend');
  assert.ok(legend);
  const entries = legend.props.children;
  assert.equal(entries.length, colors.size);
  assert.deepEqual(entries.map((entry) => entry.props.children[1].props.children), [...network.goods].sort());
  for (const entry of entries) {
    const [swatch, label] = entry.props.children;
    assert.equal(swatch.props.style.backgroundColor, colors.get(label.props.children));
    assert.equal(swatch.props['aria-hidden'], 'true');
  }
});
