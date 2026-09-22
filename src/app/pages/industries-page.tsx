import { useState } from 'react';
import { businessLevels, industrySlots, type BusinessLevel, type IndustrySlot } from '../game-state/types';
import { useIndustryTypes } from '../game-state/industry-state';
import { useIndustries } from '../game-state/industries-state';
import { useCities } from '../game-state/city-state';

export function IndustriesPage() {
  const { industryTypes } = useIndustryTypes();
  const { cities } = useCities();
  const { industries, addIndustry, removeIndustry, setIndustryLevel } = useIndustries();
  const [newTypeName, setNewTypeName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCitySlot, setNewCitySlot] = useState<IndustrySlot>(0);

  const canAdd = industryTypes.length > 0 && cities.length > 0;

  const handleAdd = () => {
    if (newTypeName === '' || newCity === '') return;
    addIndustry({ typeName: newTypeName, city: newCity, citySlot: newCitySlot, level: 1 });
    setNewTypeName('');
    setNewCity('');
    setNewCitySlot(0);
  };

  return (
    <div className="industries-page">
      <table className="industries-page__table">
        <thead>
          <tr>
            <th>Type</th>
            <th>City</th>
            <th>Slot</th>
            <th>Level</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {industries.length === 0 && (
            <tr>
              <td colSpan={5} className="industries-page__empty">
                No industries yet.
              </td>
            </tr>
          )}
          {industries.map((industry) => (
            <tr key={`${industry.city}-${industry.citySlot}`}>
              <td>{industry.typeName}</td>
              <td>{industry.city}</td>
              <td>{industry.citySlot}</td>
              <td>
                <select
                  value={industry.level}
                  onChange={(event) =>
                    setIndustryLevel(industry.city, industry.citySlot, Number(event.target.value) as BusinessLevel)
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
                  onClick={() => removeIndustry(industry.city, industry.citySlot)}
                  aria-label={`Remove ${industry.typeName} at ${industry.city} slot ${industry.citySlot}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="industries-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <select value={newTypeName} onChange={(event) => setNewTypeName(event.target.value)}>
          <option value="">Select type…</option>
          {industryTypes.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        <select value={newCity} onChange={(event) => setNewCity(event.target.value)}>
          <option value="">Select city…</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        <select
          value={newCitySlot}
          onChange={(event) => setNewCitySlot(Number(event.target.value) as IndustrySlot)}
        >
          {industrySlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!canAdd}>
          Add
        </button>
      </form>
      {!canAdd && <p className="industries-page__hint">Add an industry type and a city on the previous pages first.</p>}
    </div>
  );
}
