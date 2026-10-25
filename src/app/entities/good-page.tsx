import { useEffect, useState } from 'react';
import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useGoods } from '../game-state/goods-state';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { cityGoodDemandRows, formatIndustryAmount, type CityGoodDemandSort } from '../pages/city-good-balance';
import { useGoodsFlow } from '../solver';
import { useNavigation } from '../navigation';
import { pages, pathForPageIndex } from '../pages/pages';
import { pathForCity } from './city-routes';
import { adjacentGoods, goodSlug, pathForGood } from './good-routes';
import { pathForRuralBusiness } from './rural-business-routes';
import { pathForRuralBusinessType } from './rural-business-type-routes';

type SourceSort = { key: 'source' | 'used' | 'excess' | 'load'; descending: boolean };

export function GoodPage({ slug }: { slug: string }) {
  const { goods } = useGoods();
  const { cities } = useCities();
  const { demands } = useDemands();
  const { industries } = useIndustries();
  const { industryTypes } = useIndustryTypes();
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { ruralBusinesses, addRuralBusiness } = useRuralBusinesses();
  const { navigate } = useNavigation();
  const { solution } = useGoodsFlow();
  const [sort, setSort] = useState<CityGoodDemandSort>({ key: 'city', descending: false });
  const [sourceSort, setSourceSort] = useState<SourceSort>({ key: 'source', descending: false });
  const [newProducerName, setNewProducerName] = useState('');
  const [selectedProducerTypeName, setSelectedProducerTypeName] = useState('');
  const good = goods.find((existing) => goodSlug(existing) === slug);

  useEffect(() => {
    if (good === undefined) return;
    const previousTitle = document.title;
    document.title = `Good: ${good}`;
    return () => {
      document.title = previousTitle;
    };
  }, [good]);

  if (good === undefined) {
    return (
      <section className="good-page">
        <p className="good-page__empty">No good found for "{slug}".</p>
      </section>
    );
  }

  const adjacent = adjacentGoods(goods, good);
  const demand = demands.find((existing) => existing.good === good);
  const showPopulationDemand = demand !== undefined && demand.wagonsPerMillion > 0;
  const showIndustryDemand = industryTypes.some((type) => type.rawMaterials.some((flow) => flow.good === good));
  const showIndustryProduction = industryTypes.some((type) => type.products.some((flow) => flow.good === good));
  const activeSort: CityGoodDemandSort =
    ((sort.key === 'demand' || sort.key === 'unmet') && !showPopulationDemand) ||
    (sort.key === 'industryDemand' && !showIndustryDemand) ||
    sort.key === 'industryProduction'
      ? { key: 'city', descending: false }
      : sort;
  const consumers = cityGoodDemandRows(good, cities, demand, industries, industryTypes, solution, activeSort)
    .filter((row) => row.amount > 0 || row.hasIndustryDemand);
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  const sumOrUnknown = (values: (number | undefined)[]) =>
    values.some((value) => value === undefined) ? undefined : sum(values as number[]);
  const link = (path: string, label: string) => (
    <a
      href={path}
      onClick={(event) => {
        event.preventDefault();
        navigate(path);
      }}
    >
      {label}
    </a>
  );
  const sortableHeader = <K extends string>(
    active: { key: K; descending: boolean },
    setActive: (sort: { key: K; descending: boolean }) => void,
    key: K,
    label: string,
    title?: string,
    className?: string,
  ) => (
    <th className={className} title={title} aria-sort={active.key === key ? active.descending ? 'descending' : 'ascending' : 'none'}>
      <button
        type="button"
        onClick={() => setActive({ key, descending: active.key === key ? !active.descending : false })}
      >
        {label} <span aria-hidden="true">{active.key === key ? active.descending ? '↓' : '↑' : '↕'}</span>
      </button>
    </th>
  );
  const sortHeader = (key: CityGoodDemandSort['key'], label: string, title?: string, className?: string) =>
    sortableHeader(activeSort, setSort, key, label, title, className);
  const producerTypes = ruralBusinessTypes.filter((type) => type.good === good);
  const selectedProducerType =
    producerTypes.find((type) => type.name === selectedProducerTypeName) ?? producerTypes[0];
  const producers = ruralBusinesses.flatMap((business) => {
    const type = ruralBusinessTypes.find((existing) => existing.name === business.typeName && existing.good === good);
    return type === undefined ? [] : [{ business, type }];
  });
  const trimmedProducerName = newProducerName.trim();
  const canAddProducer =
    selectedProducerType !== undefined &&
    trimmedProducerName !== '' &&
    !ruralBusinesses.some((business) => business.name === trimmedProducerName);
  const addProducer = () => {
    if (!canAddProducer || selectedProducerType === undefined) return;
    addRuralBusiness({ name: trimmedProducerName, typeName: selectedProducerType.name, level: 1 });
    setNewProducerName('');
  };
  const sources = [
    ...producers.map(({ business, type }) => ({
      key: `rural:${business.name}`,
      label: business.name,
      name: link(pathForRuralBusiness(business), business.name),
      type: link(pathForRuralBusinessType(type), type.name),
      level: business.level,
      actual: sum(solution.contributorFlows
        .filter((flow) => flow.good === good && flow.contributor.kind === 'rural business' &&
          flow.contributor.name === business.name)
        .map((flow) => flow.served)),
      maximum: type.productionByLevel[business.level],
    })),
    ...industries.flatMap((industry) => {
      const type = industryTypes.find((existing) => existing.name === industry.typeName);
      const outputs = (type?.products ?? []).filter((flow) => flow.good === good);
      if (type === undefined || outputs.length === 0) return [];
      const city = cities.find((existing) => existing.name === industry.city);
      return [{
        key: `industry:${industry.city}:${industry.citySlot}`,
        label: industry.city,
        name: city === undefined ? industry.city : link(pathForCity(city), city.name),
        type: type.name,
        level: industry.level,
        actual: sum(solution.contributorFlows
          .filter((flow) => flow.good === good && flow.contributor.kind === 'industry' &&
            flow.contributor.city === industry.city && flow.contributor.slot === industry.citySlot)
          .map((flow) => flow.served)),
        maximum: sumOrUnknown(outputs.map((flow) => flow.amountByLevel[industry.level])),
      }];
    }),
  ];
  const sortValue = ({ actual, maximum }: { actual: number; maximum: number | undefined }) => {
    if (sourceSort.key === 'used') return actual;
    if (sourceSort.key === 'excess') return maximum === undefined ? undefined : maximum - actual;
    return maximum === undefined || maximum <= 0 ? undefined : actual / maximum;
  };
  const sortedSources = [...sources].sort((left, right) => {
    const direction = sourceSort.descending ? -1 : 1;
    if (sourceSort.key === 'source') return direction * left.label.localeCompare(right.label);
    const leftValue = sortValue(left);
    const rightValue = sortValue(right);
    if (leftValue === undefined && rightValue !== undefined) return 1;
    if (rightValue === undefined && leftValue !== undefined) return -1;
    return direction * ((leftValue ?? 0) - (rightValue ?? 0)) || left.label.localeCompare(right.label);
  });
  const sourceSortHeader = (key: SourceSort['key'], label: string, title?: string) =>
    sortableHeader(sourceSort, setSourceSort, key, label, title);
  const showSources = producerTypes.length > 0 || showIndustryProduction;
  const sourceColumns = 6;
  const consumerColumns = 2 + (showPopulationDemand ? 2 : 0) + (showIndustryDemand ? 1 : 0);
  const divider = showSources ? 'good-page__divider' : undefined;
  const cityGoodBalancePath = (city: string) =>
    `${pathForPageIndex(pages.findIndex((page) => page.slug === 'city-good-balance'))}?${new URLSearchParams({ city, good })}`;
  const productionCells = (actual: number, maximum: number | undefined, Cell: 'td' | 'th' = 'td') => (
    <>
      <Cell>{actual.toFixed(2)}</Cell>
      <Cell>{maximum === undefined ? '?' : (maximum - actual).toFixed(2)}</Cell>
      <Cell>{maximum === undefined || maximum <= 0 ? '?' : `${Math.round(100 * actual / maximum)}%`}</Cell>
    </>
  );
  const showConsumers = showPopulationDemand || showIndustryDemand;

  return (
    <section className="good-page">
      <div className="good-page__heading">
        {adjacent !== undefined && goods.length > 1 && (
          <button
            className="good-page__navigate"
            type="button"
            aria-label={`Previous good: ${adjacent.previous}`}
            title={`Previous good: ${adjacent.previous}`}
            onClick={() => navigate(pathForGood(adjacent.previous))}
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        <h1>{good}</h1>
        {adjacent !== undefined && goods.length > 1 && (
          <button
            className="good-page__navigate"
            type="button"
            aria-label={`Next good: ${adjacent.next}`}
            title={`Next good: ${adjacent.next}`}
            onClick={() => navigate(pathForGood(adjacent.next))}
          >
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <h2>Production and consumption (wagons/week)</h2>
      {showPopulationDemand && (
        <p>
          Minimum population: {demand.minPopulation.toLocaleString()} · Wagons per million: {demand.wagonsPerMillion}
        </p>
      )}
      {!showSources && !showConsumers ? (
        <p className="good-page__empty">No population demand, industry demand or production.</p>
      ) : (
      <div className="good-page__balance">
        <table className="good-page__table">
          <thead>
            <tr>
              {showSources && (
                <>
                  {sourceSortHeader('source', 'Source')}
                  <th>Type</th>
                  <th>Level</th>
                  {sourceSortHeader('used', 'Used', 'Solver-predicted output used locally or shipped')}
                  {sourceSortHeader('excess', 'Excess', 'Weekly capacity that remains unused')}
                  {sourceSortHeader('load', 'Load', 'Used production as a percentage of capacity')}
                </>
              )}
              {showConsumers && (
                <>
                  {sortHeader('city', 'City', undefined, divider)}
                  <th>Population</th>
                  {showPopulationDemand && sortHeader('demand', 'Population demand')}
                  {showIndustryDemand && sortHeader('industryDemand', 'Industry demand', 'Solver-predicted raw-material consumption / recipe maximum (percent of maximum); sorted by actual consumption')}
                  {showPopulationDemand && sortHeader('unmet', 'Unmet population demand', 'Population demand minus served population supply; excludes industry demand')}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(showSources ? sortedSources.length : 0, showConsumers ? consumers.length : 0) }, (_, index) => {
              const source = sortedSources[index];
              const consumer = consumers[index];
              return (
                <tr key={index}>
                  {showSources && (source === undefined ? (
                    Array.from({ length: sourceColumns }, (_, column) => <td key={`source-${column}`} />)
                  ) : (
                    <>
                      <td>{source.name}</td>
                      <td>{source.type}</td>
                      <td>{source.level}</td>
                      {productionCells(source.actual, source.maximum)}
                    </>
                  ))}
                  {showConsumers && (consumer === undefined ? (
                    Array.from({ length: consumerColumns }, (_, column) => (
                      <td key={`consumer-${column}`} className={column === 0 ? divider : undefined} />
                    ))
                  ) : (
                    <>
                      <td className={divider}>{link(cityGoodBalancePath(consumer.city.name), consumer.city.name)}</td>
                      <td>{consumer.city.population.toLocaleString()}</td>
                      {showPopulationDemand && <td>{consumer.amount.toFixed(2)}</td>}
                      {showIndustryDemand && <td>{formatIndustryAmount(consumer.industryDemand, consumer.maxIndustryDemand)}</td>}
                      {showPopulationDemand && <td>{consumer.unmet.toFixed(2)}</td>}
                    </>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              {showSources && (
                <>
                  <th colSpan={3}>Total</th>
                  {productionCells(
                    sum(sources.map((source) => source.actual)),
                    sumOrUnknown(sources.map((source) => source.maximum)),
                    'th',
                  )}
                </>
              )}
              {showConsumers && (
                <>
                  <th colSpan={2} className={divider}>Total</th>
                  {showPopulationDemand && <th>{sum(consumers.map((row) => row.amount)).toFixed(2)}</th>}
                  {showIndustryDemand && (
                    <th>
                      {formatIndustryAmount(
                        sum(consumers.map((row) => row.industryDemand)),
                        sumOrUnknown(consumers.map((row) => row.maxIndustryDemand)),
                      )}
                    </th>
                  )}
                  {showPopulationDemand && <th>{sum(consumers.map((row) => row.unmet)).toFixed(2)}</th>}
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
      )}
          {producerTypes.length > 0 && (
          <form
            className="good-page__add"
            onSubmit={(event) => {
              event.preventDefault();
              addProducer();
            }}
          >
            <input
              type="text"
              value={newProducerName}
              onChange={(event) => setNewProducerName(event.target.value)}
              placeholder="New producer name"
              aria-label={`New ${good} producer name`}
            />
            {producerTypes.length === 1 ? (
              <span>{producerTypes[0].name}</span>
            ) : (
              <select
                aria-label="Producer type"
                value={selectedProducerType?.name ?? ''}
                onChange={(event) => setSelectedProducerTypeName(event.target.value)}
              >
                {producerTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            )}
            <button type="submit" disabled={!canAddProducer}>
              Add
            </button>
          </form>
          )}
    </section>
  );
}
