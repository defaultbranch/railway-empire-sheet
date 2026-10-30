import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useGoods } from '../game-state/goods-state';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { totalDemandAcrossCities } from './total-demand';
import { producerFor, totalSupply } from './supply-demand';

export function SupplyDemandPage() {
  const { goods } = useGoods();
  const { demands } = useDemands();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { industries } = useIndustries();
  const { industryTypes } = useIndustryTypes();

  const supply = totalSupply(goods, ruralBusinesses, ruralBusinessTypes, industries, industryTypes, demands, cities);
  const demand = totalDemandAcrossCities(demands, cities, industryTypes);

  return (
    <div className="supply-demand-page">
      <table className="supply-demand-page__table">
        <thead>
          <tr>
            <th>Good</th>
            <th>Supply (wagons/week)</th>
            <th>Demand (wagons/week)</th>
            <th>Suggestion</th>
          </tr>
        </thead>
        <tbody>
          {goods.length === 0 && (
            <tr>
              <td colSpan={4} className="supply-demand-page__empty">
                No goods yet.
              </td>
            </tr>
          )}
          {goods.map((good) => {
            const deficit = (demand.get(good) ?? 0) - (supply.get(good) ?? 0);
            const producer = deficit > 0 ? producerFor(good, ruralBusinessTypes, industryTypes) : undefined;
            return (
              <tr key={good}>
                <td>{good}</td>
                <td>{(supply.get(good) ?? 0).toFixed(2)}</td>
                <td>{(demand.get(good) ?? 0).toFixed(2)}</td>
                <td>
                  {deficit <= 0 ? '' : producer === undefined ? 'No known producer' : `Add ${producer.name}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
