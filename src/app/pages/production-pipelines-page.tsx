import { useDemands } from '../game-state/demands-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { computePipeline } from './production-pipeline';

export function ProductionPipelinesPage() {
  const { demands } = useDemands();
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { industryTypes } = useIndustryTypes();

  const rows = [...demands]
    .sort((a, b) => a.minPopulation - b.minPopulation)
    .map((demand) => ({
      good: demand.good,
      pipeline: computePipeline(demand.good, 1, ruralBusinessTypes, industryTypes),
    }));

  return (
    <div className="production-pipelines-page">
      <table className="production-pipelines-page__table">
        <thead>
          <tr>
            <th>Good</th>
            <th>Relative setup cost</th>
            <th>Involved</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="production-pipelines-page__empty">
                No demands yet.
              </td>
            </tr>
          )}
          {rows.map(({ good, pipeline }) => (
            <tr key={good}>
              <td>{good}</td>
              <td>
                {pipeline?.totalCost === undefined ? '—' : Math.round(pipeline.totalCost).toLocaleString()}
              </td>
              <td>
                {pipeline === undefined
                  ? '—'
                  : pipeline.steps.map((step) => `${step.multiplier.toFixed(3)}× ${step.name}`).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
