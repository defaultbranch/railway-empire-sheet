import { useState } from 'react';
import { useGameState } from '../game-state';

export function DemandsPage() {
  const { goods, demands, addDemand, removeDemand, setDemandMinPopulation, setDemandWagonsPerMillion } =
    useGameState();
  const [newGood, setNewGood] = useState('');

  const availableGoods = goods.filter((good) => !demands.some((demand) => demand.good === good));

  const handleAdd = () => {
    if (newGood === '') return;
    addDemand(newGood);
    setNewGood('');
  };

  return (
    <div className="demands-page">
      <table className="demands-page__table">
        <thead>
          <tr>
            <th>Good</th>
            <th>Min. population</th>
            <th>Wagons/week per million</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {demands.length === 0 && (
            <tr>
              <td colSpan={4} className="demands-page__empty">
                No demands yet.
              </td>
            </tr>
          )}
          {demands.map((demand) => (
            <tr key={demand.good}>
              <td>{demand.good}</td>
              <td>
                <input
                  type="number"
                  min={0}
                  value={demand.minPopulation}
                  onChange={(event) => setDemandMinPopulation(demand.good, Number(event.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  value={demand.wagonsPerMillion}
                  onChange={(event) => setDemandWagonsPerMillion(demand.good, Number(event.target.value))}
                />
              </td>
              <td>
                <button type="button" onClick={() => removeDemand(demand.good)} aria-label={`Remove ${demand.good} demand`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="demands-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <select value={newGood} onChange={(event) => setNewGood(event.target.value)}>
          <option value="">Select good…</option>
          {availableGoods.map((good) => (
            <option key={good} value={good}>
              {good}
            </option>
          ))}
        </select>
        <button type="submit" disabled={availableGoods.length === 0}>
          Add
        </button>
      </form>
      {goods.length === 0 && <p className="demands-page__hint">Add a good on an earlier page first.</p>}
    </div>
  );
}
