import { useWarehouses } from '../game-state/warehouses-state';
import { warehouseSlug } from './warehouse-routes';

export function WarehousePage({ slug }: { slug: string }) {
  const { warehouses } = useWarehouses();
  const warehouse = warehouses.find((existing) => warehouseSlug(existing) === slug);

  if (warehouse === undefined) {
    return (
      <section className="warehouse-page">
        <p className="warehouse-page__empty">No warehouse found for "{slug}".</p>
      </section>
    );
  }

  return (
    <section className="warehouse-page">
      <h1>{warehouse.name}</h1>
      <p className="warehouse-page__tracks">Tracks: {warehouse.tracks}</p>
    </section>
  );
}
