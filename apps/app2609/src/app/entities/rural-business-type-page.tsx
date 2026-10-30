import { useEffect, useState } from 'react';
import { businessLevels } from '../game-state/types';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useNavigation } from '../navigation';
import { pathForRuralBusiness } from './rural-business-routes';
import { ruralBusinessTypeSlug } from './rural-business-type-routes';

export function RuralBusinessTypePage({ slug }: { slug: string }) {
  const { ruralBusinessTypes, setRuralBusinessProduction } = useRuralBusinessTypes();
  const { ruralBusinesses, addRuralBusiness } = useRuralBusinesses();
  const { navigate } = useNavigation();
  const [newBusinessName, setNewBusinessName] = useState('');
  const type = ruralBusinessTypes.find((existing) => ruralBusinessTypeSlug(existing) === slug);

  useEffect(() => {
    if (type === undefined) return;
    const previousTitle = document.title;
    document.title = `Rural type: ${type.name}`;
    return () => {
      document.title = previousTitle;
    };
  }, [type]);

  if (type === undefined) {
    return (
      <section className="rural-business-type-page">
        <p className="rural-business-type-page__empty">No rural business type found for "{slug}".</p>
      </section>
    );
  }

  const businesses = ruralBusinesses
    .filter((business) => business.typeName === type.name)
    .sort((left, right) => left.name.localeCompare(right.name));
  const trimmedBusinessName = newBusinessName.trim();
  const canAddBusiness =
    trimmedBusinessName !== '' && !ruralBusinesses.some((business) => business.name === trimmedBusinessName);

  const addBusiness = () => {
    if (!canAddBusiness) return;
    addRuralBusiness({ name: trimmedBusinessName, typeName: type.name, level: 1 });
    setNewBusinessName('');
  };

  return (
    <section className="rural-business-type-page">
      <h1>{type.name}</h1>
      <p className="rural-business-type-page__good">Produces: {type.good}</p>
      <p className="rural-business-type-page__setup-cost">
        Setup cost basis: {type.setupCostBasis === undefined ? '?' : type.setupCostBasis.toLocaleString()}
      </p>
      <section className="rural-business-type-page__production">
        <h2>Weekly production</h2>
        <table className="rural-business-type-page__table">
          <thead>
            <tr>
              {businessLevels.map((level) => (
                <th key={level}>Level {level}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {businessLevels.map((level) => (
                <td key={level}>
                  <input
                    type="number"
                    min={0}
                    value={type.productionByLevel[level] ?? ''}
                    placeholder="?"
                    aria-label={`Level ${level} weekly production`}
                    onChange={(event) => {
                      const value = event.target.value;
                      setRuralBusinessProduction(type.name, level, value === '' ? undefined : Number(value));
                    }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
      <section className="rural-business-type-page__businesses">
        <h2>Placed businesses</h2>
        {businesses.length === 0 ? (
          <p className="rural-business-type-page__empty">No businesses use this type.</p>
        ) : (
          <table className="rural-business-type-page__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Level</th>
                <th>Weekly production</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => {
                const path = pathForRuralBusiness(business);
                return (
                  <tr key={business.name}>
                    <td>
                      <a
                        href={path}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate(path);
                        }}
                      >
                        {business.name}
                      </a>
                    </td>
                    <td>{business.level}</td>
                    <td>{type.productionByLevel[business.level] ?? '?'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <form
          className="rural-business-type-page__add"
          onSubmit={(event) => {
            event.preventDefault();
            addBusiness();
          }}
        >
          <input
            type="text"
            value={newBusinessName}
            onChange={(event) => setNewBusinessName(event.target.value)}
            placeholder="New business name"
            aria-label={`New ${type.name} business name`}
          />
          <button type="submit" disabled={!canAddBusiness}>
            Add
          </button>
        </form>
      </section>
    </section>
  );
}
