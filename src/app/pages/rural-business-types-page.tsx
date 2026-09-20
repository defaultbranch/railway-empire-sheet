import { useState } from 'react';
import { businessLevels, emptyProductionByLevel } from '../game-state/types';
import { useGoods } from '../game-state/goods-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';

export function RuralBusinessTypesPage() {
  const { goods } = useGoods();
  const { ruralBusinessTypes, addRuralBusinessType, removeRuralBusinessType, setRuralBusinessProduction } =
    useRuralBusinessTypes();
  const [newName, setNewName] = useState('');
  const [newGood, setNewGood] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (name === '' || newGood === '') return;
    addRuralBusinessType({ name, good: newGood, productionByLevel: emptyProductionByLevel() });
    setNewName('');
    setNewGood('');
  };

  return (
    <div className="rural-business-types-page">
      <table className="rural-business-types-page__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Good</th>
            {businessLevels.map((level) => (
              <th key={level}>Level {level}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {ruralBusinessTypes.length === 0 && (
            <tr>
              <td colSpan={businessLevels.length + 3} className="rural-business-types-page__empty">
                No rural business types yet.
              </td>
            </tr>
          )}
          {ruralBusinessTypes.map((type) => (
            <tr key={type.name}>
              <td>{type.name}</td>
              <td>{type.good}</td>
              {businessLevels.map((level) => (
                <td key={level}>
                  <input
                    type="number"
                    min={0}
                    value={type.productionByLevel[level] ?? ''}
                    placeholder="?"
                    onChange={(event) => {
                      const value = event.target.value;
                      setRuralBusinessProduction(type.name, level, value === '' ? undefined : Number(value));
                    }}
                  />
                </td>
              ))}
              <td>
                <button type="button" onClick={() => removeRuralBusinessType(type.name)} aria-label={`Remove ${type.name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="rural-business-types-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New type name"
        />
        <select value={newGood} onChange={(event) => setNewGood(event.target.value)}>
          <option value="">Select good…</option>
          {goods.map((good) => (
            <option key={good} value={good}>
              {good}
            </option>
          ))}
        </select>
        <button type="submit" disabled={goods.length === 0}>
          Add
        </button>
      </form>
      {goods.length === 0 && (
        <p className="rural-business-types-page__hint">Add a good on the previous page first.</p>
      )}
    </div>
  );
}
