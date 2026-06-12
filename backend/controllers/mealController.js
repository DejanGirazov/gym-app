import mealModal from "../MongoDB/modals/mealModal.js";

export const createLog = async (req, res) => {
  try {
    const { foods, type } = req.body;
    if (!foods || !type || !Array.isArray(foods)) {
      return res.status(400).json({ error: "Foods and type are required" });
    }
    const calories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const proteins = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
    const carbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const fats = foods.reduce((sum, f) => sum + (f.fat || 0), 0);
    const meal = new mealModal({
      user: req.user._id,
      type,
      totalCalories: calories,
      totalProteins: proteins,
      totalCarbohydrates: carbs,
      totalFats: fats,
      foods,
    });
    await meal.save();
    res.status(200).json(meal);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};
export const getAllMeals = async (req, res) => {
  try {
    const user = req.user._id;
    const meals = await mealModal.find({ user }).sort({ createdAt: -1 });
    res.status(200).json(meals);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};
export const updateMeal = async (req, res) => {
  try {
    const { foods, type } = req.body;

    if (!foods || !type || !Array.isArray(foods)) {
      return res.status(400).json({ error: "Foods and type are required" });
    }

    const id = req.params.id;

    const calories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const proteins = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
    const carbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const fats = foods.reduce((sum, f) => sum + (f.fat || 0), 0);

    const meal = await mealModal.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        type,
        totalCalories: calories,
        totalProteins: proteins,
        totalCarbohydrates: carbs,
        totalFats: fats,
        foods,
      },
      { new: true },
    );

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    return res.status(200).json(meal);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      error: "Server error",
      errorMessage: err.message,
    });
  }
};
export const deleteMeal = async (req, res) => {
  try {
    const id = req.params.id;
    const meal = await mealModal.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }
    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};
export const getMeal = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user._id;
    const meal = await mealModal.findOne({
      _id: id,
      user: req.user._id,
    });
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }
    if (meal.user.toString() !== user.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.status(200).json(meal);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};
export const searchMeal = async (req, res) => {
  try {
    const { food } = req.query;

    if (!food) {
      return res.status(400).json({
        error: "Food query is required",
      });
    }

    //${process.env.USDA_API_KEY}  ${encodeURIComponent(food)}
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search` +
        `?api_key=${process.env.USDA_API_KEY}` +
        `&query=${encodeURIComponent(food)}` +
        `&dataType=Foundation,SR%20Legacy`,
    );

    const data = await response.json();
    const validFoods = (data.foods || []).filter((food) => {
      if (!food.foodNutrients?.length) return false;

      const hasCalories = food.foodNutrients.some(
        (n) => n.nutrientName === "Energy" && n.value > 0,
      );
      const hasProtein = food.foodNutrients.some(
        (n) => n.nutrientName === "Protein",
      );

      return hasCalories && hasProtein;
    });
    const foods = validFoods.map((food) => ({
      id: food.fdcId,
      name: food.description,
      calories:
        food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0,
      protein:
        food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value ||
        0,
      carbs:
        food.foodNutrients.find(
          (n) => n.nutrientName === "Carbohydrate, by difference",
        )?.value || 0,
      fat:
        food.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")
          ?.value || 0,
    }));

    res.status(200).json(foods);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      error: "Server error",
      errorMessage: err.message,
    });
  }
};

export const searchMealById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Food ID is required" });
    }

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${id}?api_key=${process.env.USDA_API_KEY}`,
    );
    const food = await response.json();

    // Determine base weight
    let baseWeight = 100;
    if (food.servingSize) {
      baseWeight = food.servingSize;
    } else if (food.foodPortions?.length > 0) {
      baseWeight = food.foodPortions[0].gramWeight;
    }

    // Helper: pull a nutrient value from either format
    const getNutrient = (labelKey, nutrientNames) => {
      // Format 1: labelNutrients (Branded foods)
      if (food.labelNutrients?.[labelKey]?.value != null) {
        return food.labelNutrients[labelKey].value;
      }
      // Format 2: foodNutrients array (Foundation / SR Legacy)
      const match = food.foodNutrients?.find((n) =>
        nutrientNames.includes(n.nutrientName ?? n.name),
      );
      return match?.amount ?? match?.value ?? 0;
    };

    return res.status(200).json({
      id: food.fdcId,
      name: food.description,
      BaseWeight: baseWeight,
      servingUnit: food.servingSizeUnit ?? "g",
      calories: getNutrient("calories", ["Energy"]),
      protein: getNutrient("protein", ["Protein"]),
      carbs: getNutrient("carbohydrates", ["Carbohydrate, by difference"]),
      fat: getNutrient("fat", ["Total lipid (fat)"]),
    });
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ error: "Server error", errorMessage: err.message });
  }
};
