-- CreateIndex
CREATE INDEX "FoodItem_userId_idx" ON "FoodItem"("userId");

-- CreateIndex
CREATE INDEX "MealFoodItem_mealId_idx" ON "MealFoodItem"("mealId");

-- CreateIndex
CREATE INDEX "MealFoodItem_foodItemId_idx" ON "MealFoodItem"("foodItemId");
