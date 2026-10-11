import { useEffect } from 'react';
import { businessLevels } from '../game-state/types';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useNavigation } from '../navigation';
import { pathForRuralBusiness } from './rural-business-routes';
import { ruralBusinessTypeSlug } from './rural-business-type-routes';

export function RuralBusinessTypePage({ slug }: { slug: string }) {
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { ruralBusinesses } = useRuralBusinesses();
  const { navigate } = useNavigation();
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
    .sort((first, second) => first.name.localeCompare(second.name));

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
                <td key={level}>{type.productionByLevel[level] ?? '?'}</td>
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
      </section>
    </section>
  );
}
