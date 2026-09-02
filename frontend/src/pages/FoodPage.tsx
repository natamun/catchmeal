import { useEffect, useRef, useState } from 'react';

import FoodItemForm from '../components/food/FoodItemForm';
import FoodItemList from '../components/food/FoodItemList';
import type { FoodItem } from '../components/food/types';
import { CURRENT_USER_ID } from '../constants/currentUser';

const API_URL = import.meta.env.VITE_API_URL;

export default function FoodPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/users/${CURRENT_USER_ID}/food-items`)
      .then((response) => response.json())
      .then((data: FoodItem[]) => setFoodItems(data))
      .catch((err: unknown) => console.error(err));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800">Aliments</h2>

      <FoodItemForm
        dialogRef={dialogRef}
        onItemAdded={(item) => setFoodItems((prev) => [...prev, item])}
      />

      <FoodItemList items={foodItems} dialogRef={dialogRef} />
    </div>
  );
}
