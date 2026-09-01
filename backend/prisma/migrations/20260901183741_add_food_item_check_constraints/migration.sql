ALTER TABLE "FoodItem" ADD CONSTRAINT food_item_name_not_empty CHECK (length(trim("name")) > 0);
ALTER TABLE "FoodItem" ADD CONSTRAINT food_item_base_quantity_positive CHECK ("baseQuantity" > 0);
ALTER TABLE "FoodItem" ADD CONSTRAINT food_item_kcal_non_negative CHECK ("kcal" >= 0);
ALTER TABLE "FoodItem" ADD CONSTRAINT food_item_protein_non_negative CHECK ("protein" >= 0);
ALTER TABLE "FoodItem" ADD CONSTRAINT food_item_carbs_non_negative CHECK ("carbs" >= 0);
ALTER TABLE "FoodItem" ADD CONSTRAINT food_item_fat_non_negative CHECK ("fat" >= 0);