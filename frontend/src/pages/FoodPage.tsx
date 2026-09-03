import { useEffect, useRef, useState } from 'react';

import { listFoodItems } from '../components/food/api';
import FoodItemForm from '../components/food/FoodItemForm';
import FoodItemList from '../components/food/FoodItemList';
import type { FoodItem } from '../components/food/types';

export default function FoodPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    listFoodItems(controller.signal)
      .then(setFoodItems)
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error(err);
        setLoadError('Impossible de charger tes aliments, réessaye.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const openDialog = (item: FoodItem | null) => {
    setEditingItem(item);
    dialogRef.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800">Aliments</h2>

      <FoodItemForm
        dialogRef={dialogRef}
        editingItem={editingItem}
        onItemAdded={(item) => setFoodItems((prev) => [...prev, item])}
        onItemUpdated={(updated) =>
          setFoodItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          )
        }
        onItemDeleted={(id) =>
          setFoodItems((prev) => prev.filter((item) => item.id !== id))
        }
      />

      <FoodItemList
        items={foodItems}
        isLoading={isLoading}
        loadError={loadError}
        onAdd={() => openDialog(null)}
        onEdit={(item) => openDialog(item)}
      />
    </div>
  );
}
