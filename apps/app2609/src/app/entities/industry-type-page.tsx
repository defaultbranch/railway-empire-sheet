import { useEffect } from 'react';
import { businessLevels, type Good, type GoodFlow, type IndustryFlowField } from '../game-state/types';
import { useGoods } from '../game-state/goods-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useNavigation } from '../navigation';
import { NavigatableHeading } from '../navigatable-heading';
import { pathForPageIndex } from '../pages/pages';
import { industryTypeSlug, pathForIndustryType } from './industry-type-routes';

export function IndustryTypePage({ slug }: { slug: string }) {
  const { goods } = useGoods();
  const { industryTypes, addIndustryFlow, removeIndustryFlow, setIndustryFlowGood, setIndustryFlowAmount,
    setIndustrySetupCostBasis } = useIndustryTypes();
  const { navigate } = useNavigation();
  const type = industryTypes.find((entry) => industryTypeSlug(entry) === slug);
  const listPath = pathForPageIndex(2);

  useEffect(() => {
    if (type === undefined) return;
    const previousTitle = document.title;
    document.title = `Industry type: ${type.name}`;
    return () => { document.title = previousTitle; };
  }, [type]);

  const backLink = (
    <a href={listPath} onClick={(event) => { event.preventDefault(); navigate(listPath); }}>
      All industry types
    </a>
  );

  if (type === undefined) {
    return <section className="industry-type-page">{backLink}<p>No industry type found for "{slug}".</p></section>;
  }

  const headings = [...industryTypes]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => ({ title: entry.name, path: pathForIndustryType(entry) }));

  const renderFlows = (field: IndustryFlowField, label: string, flows: GoodFlow[]) => (
    <section className="industry-type-page__flows">
      <h2>{label}</h2>
      <div className="industry-type-page__table-scroll">
        <table className="industry-type-page__table">
          <thead>
            <tr><th>Good</th>{businessLevels.map((level) => <th key={level}>Level {level}</th>)}<th /></tr>
          </thead>
          <tbody>
            {flows.map((flow, index) => (
              <tr key={index}>
                <td>
                  <select value={flow.good ?? ''} aria-label={`${label} ${index + 1} good`}
                    onChange={(event) => setIndustryFlowGood(type.name, field, index, (event.target.value || undefined) as Good | undefined)}>
                    <option value="">Select good...</option>
                    {goods.map((good) => <option key={good} value={good}>{good}</option>)}
                  </select>
                </td>
                {businessLevels.map((level) => (
                  <td key={level}>
                    <input type="number" min={0} value={flow.amountByLevel[level] ?? ''} placeholder="?"
                      aria-label={`${label} ${index + 1} level ${level} weekly amount`}
                      onChange={(event) => {
                        const value = event.target.value;
                        setIndustryFlowAmount(type.name, field, index, level, value === '' ? undefined : Number(value));
                      }} />
                  </td>
                ))}
                <td>{flows.length > 1 && (
                  <button type="button" onClick={() => removeIndustryFlow(type.name, field, index)}
                    aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} title={`Remove ${label.toLowerCase()}`}>×</button>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {flows.length < 2 && <button type="button" onClick={() => addIndustryFlow(type.name, field)}>+ {label}</button>}
    </section>
  );

  return (
    <section className="industry-type-page">
      {backLink}
      <NavigatableHeading headings={headings} currentPath={pathForIndustryType(type)} onNavigate={navigate}
        navigationLabel="industry type" />
      <label className="industry-type-page__setup-cost">
        Setup cost basis
        <input type="number" min={0} value={type.setupCostBasis ?? ''} placeholder="?"
          onChange={(event) => {
            const value = event.target.value;
            setIndustrySetupCostBasis(type.name, value === '' ? undefined : Number(value));
          }} />
      </label>
      {renderFlows('rawMaterials', 'Input goods', type.rawMaterials)}
      {renderFlows('products', 'Output goods', type.products)}
    </section>
  );
}
