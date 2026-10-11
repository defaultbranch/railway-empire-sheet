import { useEffect } from 'react';
import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useGoods } from '../game-state/goods-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { businessLevels } from '../game-state/types';
import { demandForCity } from '../pages/population-demand';
import { useNavigation } from '../navigation';
import { pathForCity } from './city-routes';
import { goodSlug } from './good-routes';
import { pathForRuralBusinessType } from './rural-business-type-routes';

export function GoodPage({ slug }: { slug: string }) {
  const { goods } = useGoods();
  const { cities } = useCities();
  const { demands } = useDemands();
  const { industryTypes } = useIndustryTypes();
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { ruralBusinesses } = useRuralBusinesses();
  const { navigate } = useNavigation();
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

  const demand = demands.find((existing) => existing.good === good);
  const demandingCities = demand === undefined ? [] : cities
    .map((city) => ({ city, amount: demandForCity(demand, city) }))
    .filter(({ amount }) => amount > 0);
  const producers = ruralBusinessTypes.filter((type) => type.good === good);
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
      <h1>{good}</h1>
      <section className="good-page__demand">
        <h2>Population demand</h2>
        {demand === undefined ? (
          <p className="good-page__empty">No population demand configured.</p>
        ) : (
          <>
            <p>
              Minimum population: {demand.minPopulation.toLocaleString()} · Wagons per million: {demand.wagonsPerMillion}
            </p>
            {demandingCities.length > 0 && (
              <table className="good-page__table">
                <thead>
                  <tr>
                    <th>City</th>
                    <th>Population</th>
                    <th>Demand per week</th>
                  </tr>
                </thead>
                <tbody>
                  {demandingCities.map(({ city, amount }) => (
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
                      <td>{amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>
      <section className="good-page__rural-producers">
        <h2>Rural producers</h2>
        {producers.length === 0 ? (
          <p className="good-page__empty">No rural business type produces this good.</p>
        ) : (
          <table className="good-page__table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Placed businesses</th>
                {businessLevels.map((level) => (
                  <th key={level}>Level {level}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {producers.map((type) => {
                const path = pathForRuralBusinessType(type);
                return (
                  <tr key={type.name}>
                    <td>
                      <a
                        href={path}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(path);
                        }}
                      >
                        {type.name}
                      </a>
                    </td>
                    <td>{ruralBusinesses.filter((business) => business.typeName === type.name).length}</td>
                    {businessLevels.map((level) => (
                      <td key={level}>{type.productionByLevel[level] ?? '?'}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
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