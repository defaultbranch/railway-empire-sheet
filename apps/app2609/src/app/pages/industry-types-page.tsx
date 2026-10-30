import { useState } from 'react';
import { businessLevels, type BusinessLevel, type Good, type GoodFlow, type IndustryFlowField } from '../game-state/types';
import { useGoods } from '../game-state/goods-state';
import { useIndustryTypes } from '../game-state/industry-state';

export function IndustryTypesPage() {
  const { goods } = useGoods();
  const {
    industryTypes,
    addIndustryType,
    removeIndustryType,
    addIndustryFlow,
    removeIndustryFlow,
    setIndustryFlowGood,
    setIndustryFlowAmount,
    setIndustrySetupCostBasis,
  } = useIndustryTypes();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (name === '') return;
    addIndustryType(name);
    setNewName('');
  };

  const renderFlows = (typeName: string, field: IndustryFlowField, label: string, flows: GoodFlow[]) => (
    <div className="industry-types-page__flows">
      <span className="industry-types-page__flows-label">{label}</span>
      <table>
        <thead>
          <tr>
            <th>Good</th>
            {businessLevels.map((level) => (
              <th key={level}>L{level}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {flows.map((flow, index) => (
            <tr key={index}>
              <td>
                <select
                  value={flow.good ?? ''}
                  onChange={(event) =>
                    setIndustryFlowGood(typeName, field, index, (event.target.value || undefined) as Good | undefined)
                  }
                >
                  <option value="">Select good…</option>
                  {goods.map((good) => (
                    <option key={good} value={good}>
                      {good}
                    </option>
                  ))}
                </select>
              </td>
              {businessLevels.map((level: BusinessLevel) => (
                <td key={level}>
                  <input
                    type="number"
                    min={0}
                    value={flow.amountByLevel[level] ?? ''}
                    placeholder="?"
                    onChange={(event) => {
                      const value = event.target.value;
                      setIndustryFlowAmount(typeName, field, index, level, value === '' ? undefined : Number(value));
                    }}
                  />
                </td>
              ))}
              <td>
                {flows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIndustryFlow(typeName, field, index)}
                    aria-label={`Remove ${label.toLowerCase()}`}
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {flows.length < 2 && (
        <button type="button" onClick={() => addIndustryFlow(typeName, field)}>
          + {label}
        </button>
      )}
    </div>
  );

  return (
    <div className="industry-types-page">
      {industryTypes.length === 0 && <p className="industry-types-page__empty">No industry types yet.</p>}
      {industryTypes.map((type) => (
        <div className="industry-types-page__card" key={type.name}>
          <div className="industry-types-page__card-header">
            <h3>{type.name}</h3>
            <label className="industry-types-page__setup-cost">
              Setup cost basis
              <input
                type="number"
                min={0}
                value={type.setupCostBasis ?? ''}
                placeholder="?"
                onChange={(event) => {
                  const value = event.target.value;
                  setIndustrySetupCostBasis(type.name, value === '' ? undefined : Number(value));
                }}
              />
            </label>
            <button type="button" onClick={() => removeIndustryType(type.name)} aria-label={`Remove ${type.name}`}>
              ✕
            </button>
          </div>
          {renderFlows(type.name, 'rawMaterials', 'Raw material', type.rawMaterials)}
          {renderFlows(type.name, 'products', 'Product', type.products)}
        </div>
      ))}
      <form
        className="industry-types-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New industry type name"
        />
        <button type="submit" disabled={goods.length === 0}>
          Add
        </button>
      </form>
      {goods.length === 0 && <p className="industry-types-page__hint">Add a good on an earlier page first.</p>}
    </div>
  );
}
