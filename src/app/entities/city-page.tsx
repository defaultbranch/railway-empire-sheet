import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useGoods } from '../game-state/goods-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useGoodsFlow } from '../solver';
import { useNavigation } from '../navigation';
import { citySlug } from './city-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';
import { businessLevels, industrySlots, type BusinessLevel, type StopHost } from '../game-state/types';
import { pages, pathForPageIndex } from '../pages/pages';
import { demandForCity } from '../pages/population-demand';
import { suppliedToCityForGood } from '../pages/city-good-balance';

const hostsCity = (host: StopHost, cityName: string): boolean => host.kind === 'city' && host.city === cityName;

export function CityPage({ slug }: { slug: string }) {
  const { cities, setCityPopulation } = useCities();
  const { demands } = useDemands();
  const { goods } = useGoods();
  const { trainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const { industries, setIndustryType, setIndustryLevel } = useIndustries();
  const { industryTypes } = useIndustryTypes();
  const { network, solution } = useGoodsFlow();
  const { navigate } = useNavigation();
  const city = cities.find((existing) => citySlug(existing) === slug);

  if (city === undefined) {
    return (
      <section className="city-page">
        <p className="city-page__empty">No city found for "{slug}".</p>
      </section>
    );
  }

  const connectedStations = trainStations.filter((station) => hostsCity(station.host, city.name));
  const connectedWarehouses = warehouses.filter((warehouse) => hostsCity(warehouse.host, city.name));
  const cityIndustries = industries.filter((industry) => industry.city === city.name);
  const goodsBalances = goods.map((good) => {
    let demand = demandForCity(demands.find((existing) => existing.good === good) ?? {
      good,
      minPopulation: Number.POSITIVE_INFINITY,
      wagonsPerMillion: 0,
    }, city);
    let hasUnknownIndustryDemand = false;

    for (const industry of cityIndustries) {
      const type = industryTypes.find((existing) => existing.name === industry.typeName);
      for (const rawMaterial of type?.rawMaterials ?? []) {
        if (rawMaterial.good !== good) continue;
        const amount = rawMaterial.amountByLevel[industry.level];
        if (amount === undefined) hasUnknownIndustryDemand = true;
        else demand += amount;
      }
    }

    return {
      good,
      supplied: suppliedToCityForGood(network, solution, city.name, good),
      actualDemand: suppliedToCityForGood(network, solution, city.name, good),
      maxDemand: hasUnknownIndustryDemand ? undefined : demand,
    };
  }).filter(({ maxDemand }) => maxDemand === undefined || maxDemand > 0);
  const rawMaterialGoods = [...new Set(cityIndustries.flatMap((industry) =>
    industryTypes
      .find((type) => type.name === industry.typeName)
      ?.rawMaterials.flatMap((flow) => (flow.good === undefined ? [] : [flow.good])) ?? [],
  ))];
  const productGoods = [...new Set(cityIndustries.flatMap((industry) =>
    industryTypes
      .find((type) => type.name === industry.typeName)
      ?.products.flatMap((flow) => (flow.good === undefined ? [] : [flow.good])) ?? [],
  ))];

  const industryAmount = (slot: number, good: string, field: 'rawMaterials' | 'products') => {
    const industry = cityIndustries.find((existing) => existing.citySlot === slot);
    const type = industryTypes.find((existing) => existing.name === industry?.typeName);
    if (industry === undefined || type === undefined) return undefined;

    const recipeFlows = type[field].filter((flow) => flow.good === good);
    if (recipeFlows.length === 0) return undefined;
    const amounts = recipeFlows.map((flow) => flow.amountByLevel[industry.level]);
    const maximum = amounts.some((amount) => amount === undefined)
      ? undefined
      : amounts.reduce<number>((sum, amount) => sum + amount!, 0);
    const provided = solution.contributorFlows
      .filter(
        (flow) =>
          flow.contributor.kind === 'industry' &&
          flow.contributor.city === city.name &&
          flow.contributor.slot === industry.citySlot &&
          flow.good === good,
      )
      .reduce((sum, flow) => sum + flow.served, 0);

    return { provided, maximum };
  };

  const cityGoodBalanceIndex = pages.findIndex((page) => page.slug === 'city-good-balance');
  const cityGoodBalancePathForGood = (good: string) =>
    `${pathForPageIndex(cityGoodBalanceIndex)}?${new URLSearchParams({ city: city.name, good })}`;

  const formatIndustryAmount = (slot: number, good: string, field: 'rawMaterials' | 'products') => {
    const amount = industryAmount(slot, good, field);
    if (amount === undefined) return '—';
    const path = cityGoodBalancePathForGood(good);
    return (
      <>
        <a
          href={path}
          onClick={(event) => {
            event.preventDefault();
            navigate(path);
          }}
        >
          {amount.provided.toFixed(2)}
        </a>{' '}
        / {amount.maximum === undefined ? '?' : amount.maximum.toFixed(2)}
      </>
    );
  };

  return (
    <section className="city-page">
      <h1>{city.name}</h1>
      <label className="city-page__population">
        Population
        <input
          type="number"
          min={0}
          value={city.population}
          onChange={(event) => setCityPopulation(city.name, Number(event.target.value))}
        />
      </label>
      <section className="city-page__goods-balance">
        <h2>Goods supply and demand</h2>
        <table className="city-page__table city-page__goods-balance-table">
          <thead>
            <tr>
              <th>Good</th>
              <th>Supplied</th>
              <th>Actual demand</th>
              <th>Max demand</th>
            </tr>
          </thead>
          <tbody>
            {goodsBalances.map(({ good, supplied, actualDemand, maxDemand }) => (
              <tr key={good}>
                <td>{good}</td>
                <td>
                  <a
                    href={cityGoodBalancePathForGood(good)}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(cityGoodBalancePathForGood(good));
                    }}
                  >
                    {supplied.toFixed(2)}
                  </a>
                </td>
                <td>{actualDemand.toFixed(2)}</td>
                <td>{maxDemand === undefined ? '?' : maxDemand.toFixed(2)}</td>
              </tr>
            ))}
            {goodsBalances.length === 0 && (
              <tr>
                <td colSpan={4} className="city-page__empty">No goods yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="city-page__industries">
        <h2>Industries</h2>
        <div className="city-page__industries-scroll">
          <table className="city-page__table city-page__industries-table">
            <thead>
              <tr>
                <th rowSpan={2}>Industry</th>
                <th rowSpan={2}>Level</th>
                {rawMaterialGoods.length > 0 && <th colSpan={rawMaterialGoods.length}>Raw materials</th>}
                {productGoods.length > 0 && <th colSpan={productGoods.length}>Products</th>}
              </tr>
              <tr>
                {rawMaterialGoods.map((good) => (
                  <th key={`raw-${good}`}>{good}</th>
                ))}
                {productGoods.map((good) => (
                  <th key={`product-${good}`}>{good}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {industrySlots.map((slot) => {
                const industry = cityIndustries.find((existing) => existing.citySlot === slot);
                return (
                  <tr key={slot}>
                    <td>
                      <select
                        aria-label={`Industry assignment ${slot + 1}`}
                        value={industry?.typeName ?? ''}
                        onChange={(event) => setIndustryType(city.name, slot, event.target.value || undefined)}
                      >
                        <option value="">No industry</option>
                        {industryTypes.map((type) => (
                          <option key={type.name} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {industry === undefined ? (
                        '—'
                      ) : (
                        <select
                          aria-label={`Level for ${industry.typeName}, assignment ${slot + 1}`}
                          value={industry.level}
                          onChange={(event) =>
                            setIndustryLevel(city.name, slot, Number(event.target.value) as BusinessLevel)
                          }
                        >
                          {businessLevels.map((level) => (
                            <option key={level} value={level}>
                              Level {level}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    {rawMaterialGoods.map((good) => (
                      <td key={`raw-${good}`}>{formatIndustryAmount(slot, good, 'rawMaterials')}</td>
                    ))}
                    {productGoods.map((good) => (
                      <td key={`product-${good}`}>{formatIndustryAmount(slot, good, 'products')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="city-page__connections">
        <h2>Stations</h2>
        {connectedStations.length === 0 ? (
          <p className="city-page__empty">No connected stations.</p>
        ) : (
          <ul>
            {connectedStations.map((station) => (
              <li key={station.name}>
                <a
                  href={pathForStation(station)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForStation(station));
                  }}
                >
                  {station.name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <h2>Warehouses</h2>
        {connectedWarehouses.length === 0 ? (
          <p className="city-page__empty">No connected warehouses.</p>
        ) : (
          <ul>
            {connectedWarehouses.map((warehouse) => (
              <li key={warehouse.name}>
                <a
                  href={pathForWarehouse(warehouse)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForWarehouse(warehouse));
                  }}
                >
                  {warehouse.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
