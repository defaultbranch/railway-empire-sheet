import { useState } from 'react';
import { businessLevels, type BusinessLevel } from '../game-state/types';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';

export function RuralBusinessesPage() {
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { ruralBusinesses, addRuralBusiness, removeRuralBusiness, setRuralBusinessLevel } = useRuralBusinesses();
  const [newName, setNewName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (name === '' || newTypeName === '') return;
    addRuralBusiness({ name, typeName: newTypeName, level: 1 });
    setNewName('');
    setNewTypeName('');
  };

  return (
    <div className="rural-businesses-page">
      <table className="rural-businesses-page__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Level</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {ruralBusinesses.length === 0 && (
            <tr>
              <td colSpan={4} className="rural-businesses-page__empty">
                No rural businesses yet.
              </td>
            </tr>
          )}
          {ruralBusinesses.map((business) => (
            <tr key={business.name}>
              <td>{business.name}</td>
              <td>{business.typeName}</td>
              <td>
                <select
                  value={business.level}
                  onChange={(event) =>
                    setRuralBusinessLevel(business.name, Number(event.target.value) as BusinessLevel)
                  }
                >
                  {businessLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => removeRuralBusiness(business.name)}
                  aria-label={`Remove ${business.name}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="rural-businesses-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New business name"
        />
        <select value={newTypeName} onChange={(event) => setNewTypeName(event.target.value)}>
          <option value="">Select type…</option>
          {ruralBusinessTypes.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={ruralBusinessTypes.length === 0}>
          Add
        </button>
      </form>
      {ruralBusinessTypes.length === 0 && (
        <p className="rural-businesses-page__hint">Add a rural business type on the previous page first.</p>
      )}
    </div>
  );
}
