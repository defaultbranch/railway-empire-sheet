import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let NavigatableHeading;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ NavigatableHeading } = await server.ssrLoadModule('/src/app/navigatable-heading.tsx'));
});
after(async () => { await server?.close(); });

const render = (headings, currentPath = '/goods/wood') => renderToStaticMarkup(createElement(NavigatableHeading, {
  headings,
  currentPath,
  onNavigate: () => {},
  navigationLabel: 'good',
}));

test('headings use collection order and wrap in both directions', () => {
  const headings = [
    { title: 'Wood', path: '/goods/wood' },
    { title: 'Wheat', path: '/goods/wheat' },
    { title: 'Beer', path: '/goods/beer' },
  ];
  const first = render(headings);
  assert.match(first, /<h1>Wood<\/h1>/);
  assert.match(first, /aria-label="Previous good: Beer"/);
  assert.match(first, /aria-label="Next good: Wheat"/);
  const last = render(headings, '/goods/beer');
  assert.match(last, /aria-label="Previous good: Wheat"/);
  assert.match(last, /aria-label="Next good: Wood"/);
});

test('updated collections and heading values are reflected on the next render', () => {
  const wood = { title: 'Wood', path: '/goods/wood' };
  const wheat = { title: 'Wheat', path: '/goods/wheat' };
  assert.doesNotMatch(render([wood]), /<button/);
  assert.match(render([wood, wheat]), /aria-label="Next good: Wheat"/);
  assert.match(render([wood, { title: 'Beer', path: '/goods/beer' }]), /aria-label="Next good: Beer"/);
  assert.match(render([{ ...wood, title: 'Timber' }]), /<h1>Timber<\/h1>/);
  assert.doesNotMatch(render([wood]), /<button/);
});

test('empty collections and removed current headings render nothing', () => {
  assert.equal(render([]), '');
  assert.equal(render([{ title: 'Wheat', path: '/goods/wheat' }]), '');
});

test('arrow callbacks navigate to the matching paths after collection updates', () => {
  const destinations = [];
  const props = {
    headings: [
      { title: 'Wood', path: '/goods/wood' },
      { title: 'Wheat', path: '/goods/wheat' },
      { title: 'Beer', path: '/goods/beer' },
    ],
    currentPath: '/goods/wood',
    onNavigate: (path) => destinations.push(path),
    navigationLabel: 'good',
  };
  const initial = NavigatableHeading(props);
  initial.props.children[0].props.onClick();
  initial.props.children[2].props.onClick();
  assert.deepEqual(destinations, ['/goods/beer', '/goods/wheat']);
  const updated = NavigatableHeading({ ...props, headings: props.headings.slice(0, 2) });
  updated.props.children[0].props.onClick();
  updated.props.children[2].props.onClick();
  assert.deepEqual(destinations.slice(2), ['/goods/wheat', '/goods/wheat']);
});
