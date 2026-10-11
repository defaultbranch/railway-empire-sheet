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
      <ul className="goods-page__list">
        {goods.length === 0 && <li className="goods-page__empty">No goods yet.</li>}
        {goods.map((good) => (
          <li key={good}>
            <a
              href={pathForGood(good)}
              onClick={(event) => {
                event.preventDefault();
                navigate(pathForGood(good));
              }}
            >
              {good}
            </a>
            <button type="button" onClick={() => removeGood(good)} aria-label={`Remove ${good}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>
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
