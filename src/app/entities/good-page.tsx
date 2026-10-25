import { useEffect, useState } from 'react';
import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useGoods } from '../game-state/goods-state';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { businessLevels } from '../game-state/types';
import { cityGoodDemandRows, formatIndustryAmount, type CityGoodDemandSort } from '../pages/city-good-balance';
import { useGoodsFlow } from '../solver';
import { useNavigation } from '../navigation';
import { pathForCity } from './city-routes';
import { adjacentGoods, goodSlug, pathForGood } from './good-routes';
import { pathForRuralBusiness } from './rural-business-routes';
import { pathForRuralBusinessType } from './rural-business-type-routes';

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
    (sort.key === 'industryProduction' && !showIndustryProduction)
      ? { key: 'city', descending: false }
      : sort;
  const demandingCities = cityGoodDemandRows(good, cities, demand, industries, industryTypes, solution, activeSort);
  const sortHeader = (key: CityGoodDemandSort['key'], label: string, title?: string) => (
    <th title={title} aria-sort={activeSort.key === key ? activeSort.descending ? 'descending' : 'ascending' : 'none'}>
      <button
        type="button"
        onClick={() => setSort({ key, descending: activeSort.key === key ? !activeSort.descending : false })}
      >
        {label} <span aria-hidden="true">{activeSort.key === key ? activeSort.descending ? '↓' : '↑' : '↕'}</span>
      </button>
    </th>
  );
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
  const industryFlows = industryTypes.flatMap((type) => [
    ...type.rawMaterials
      .filter((flow) => flow.good === good)
      .map((flow) => ({ type, role: 'Raw material', flow })),
    ...type.products
      .filter((flow) => flow.good === good)
      .map((flow) => ({ type, role: 'Product', flow })),
  ]);

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
      <section className="good-page__demand">
        <h2>City demand and production (wagons/week)</h2>
        {showPopulationDemand && (
            <p>
              Minimum population: {demand.minPopulation.toLocaleString()} · Wagons per million: {demand.wagonsPerMillion}
            </p>
        )}
        {demandingCities.length === 0 ? (
          <p className="good-page__empty">No population demand, industry demand or industry production.</p>
        ) : (
              <table className="good-page__table">
                <thead>
                  <tr>
                    {sortHeader('city', 'City')}
                    <th>Population</th>
                    {showPopulationDemand && sortHeader('demand', 'Population demand')}
                    {showIndustryDemand && sortHeader('industryDemand', 'Industry demand', 'Solver-predicted raw-material consumption / recipe maximum (percent of maximum); sorted by actual consumption')}
                    {showIndustryProduction && sortHeader('industryProduction', 'Industry production', 'Solver-predicted output used locally or shipped / recipe maximum (percent of maximum); sorted by actual output')}
                    {showPopulationDemand && sortHeader('unmet', 'Unmet population demand', 'Population demand minus served population supply; excludes industry demand')}
                  </tr>
                </thead>
                <tbody>
                  {demandingCities.map(({ city, amount, unmet, industryDemand, maxIndustryDemand, industryProduction, maxIndustryProduction }) => (
                    <tr key={city.name}>
                      <td>
                        <a
                          href={pathForCity(city)}
                          onClick={(event) => {
                            event.preventDefault();
                            navigate(pathForCity(city));
                          }}
                        >
                          {city.name}
                        </a>
                      </td>
                      <td>{city.population.toLocaleString()}</td>
                      {showPopulationDemand && <td>{amount.toFixed(2)}</td>}
                      {showIndustryDemand && <td>{formatIndustryAmount(industryDemand, maxIndustryDemand)}</td>}
                      {showIndustryProduction && <td>{formatIndustryAmount(industryProduction, maxIndustryProduction)}</td>}
                      {showPopulationDemand && <td>{unmet.toFixed(2)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
        )}
      </section>
      {producerTypes.length > 0 && (
        <section className="good-page__rural-producers">
          <h2>Rural producers</h2>
          {producers.length === 0 ? (
            <p className="good-page__empty">No placed rural businesses produce this good.</p>
          ) : (
          <table className="good-page__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Level</th>
                <th>Weekly production</th>
              </tr>
            </thead>
            <tbody>
              {producers.map(({ business, type }) => {
                const businessPath = pathForRuralBusiness(business);
                const typePath = pathForRuralBusinessType(type);
                return (
                  <tr key={business.name}>
                    <td>
                      <a
                        href={businessPath}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(businessPath);
                        }}
                      >
                        {business.name}
                      </a>
                    </td>
                    <td>
                      <a
                        href={typePath}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(typePath);
                        }}
                      >
                        {type.name}
                      </a>
                    </td>
                    <td>{business.level}</td>
                    <td>{type.productionByLevel[business.level] ?? '?'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
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
        </section>
      )}
      <section className="good-page__industry-recipes">
        <h2>Industry recipes</h2>
        {industryFlows.length === 0 ? (
          <p className="good-page__empty">No industry type uses this good.</p>
        ) : (
          <table className="good-page__table">
            <thead>
              <tr>
                <th>Industry</th>
                <th>Role</th>
                {businessLevels.map((level) => (
                  <th key={level}>Level {level}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {industryFlows.map(({ type, role, flow }, index) => (
                <tr key={`${type.name}-${role}-${index}`}>
                  <td>{type.name}</td>
                  <td>{role}</td>
                  {businessLevels.map((level) => (
                    <td key={level}>{flow.amountByLevel[level] ?? '?'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
