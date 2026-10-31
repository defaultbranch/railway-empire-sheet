import { useState } from 'react';
import { useGoods } from '../game-state/goods-state';
import { useNavigation } from '../navigation';
import { pathForGood } from '../entities/good-routes';

export function GoodsPage() {
  const { goods, addGood, removeGood } = useGoods();
  const { navigate } = useNavigation();
  const [newGood, setNewGood] = useState('');

  const handleAdd = () => {
    const trimmed = newGood.trim();
    if (trimmed === '') return;
    addGood(trimmed);
    setNewGood('');
  };

  return (
    <div className="goods-page">
      {goods.length === 0 ? (
        <p className="goods-page__empty">No goods yet.</p>
      ) : (
        <table className="goods-page__table">
          <thead>
            <tr>
              <th scope="col">Good</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {goods.map((good) => (
              <tr key={good}>
                <td>
                  <a
                    href={pathForGood(good)}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(pathForGood(good));
                    }}
                  >
                    {good}
                  </a>
                </td>
                <td>
                  <button type="button" onClick={() => removeGood(good)} aria-label={`Remove ${good}`} title={`Remove ${good}`}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form
        className="goods-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input
          type="text"
          value={newGood}
          onChange={(event) => setNewGood(event.target.value)}
          placeholder="New good name"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
