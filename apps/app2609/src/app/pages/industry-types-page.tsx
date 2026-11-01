import { Fragment, useState } from 'react';
import type { GoodFlow } from '../game-state/types';
import { useGoods } from '../game-state/goods-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useNavigation } from '../navigation';
import { pathForIndustryType } from '../entities/industry-type-routes';
import { pathForGood } from '../entities/good-routes';

export function IndustryTypesPage() {
  const { navigate } = useNavigation();
  const { goods } = useGoods();
  const {
    industryTypes,
    addIndustryType,
    removeIndustryType,
    setIndustrySetupCostBasis,
  } = useIndustryTypes();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (name === '') return;
    addIndustryType(name);
    setNewName('');
  };

  const summarizeGoods = (flows: GoodFlow[]) => flows.length === 0 ? '?' : flows.map(({ good }, index) => (
    <Fragment key={index}>
      {index > 0 && ', '}
      {good == null ? '?' : (
        <a href={pathForGood(good)} onClick={(event) => {
          event.preventDefault();
          navigate(pathForGood(good));
        }}>{good}</a>
      )}
    </Fragment>
  ));

  return (
    <div className="industry-types-page">
      <div className="industry-types-page__table-scroll">
      <table className="industry-types-page__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Input goods</th>
            <th>Output goods</th>
            <th>Setup cost basis</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {industryTypes.length === 0 && (
            <tr><td colSpan={5} className="industry-types-page__empty">No industry types yet.</td></tr>
          )}
          {industryTypes.map((type) => (
            <tr key={type.name}>
              <td>
                <a href={pathForIndustryType(type)} onClick={(event) => {
                  event.preventDefault();
                  navigate(pathForIndustryType(type));
                }}>{type.name}</a>
              </td>
              <td>{summarizeGoods(type.rawMaterials)}</td>
              <td>{summarizeGoods(type.products)}</td>
              <td>
              <input
                type="number"
                min={0}
                value={type.setupCostBasis ?? ''}
                placeholder="?"
                aria-label={`${type.name} setup cost basis`}
                onChange={(event) => {
                  const value = event.target.value;
                  setIndustrySetupCostBasis(type.name, value === '' ? undefined : Number(value));
                }}
              />
              </td>
              <td>
                <button type="button" onClick={() => removeIndustryType(type.name)} aria-label={`Remove ${type.name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
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
