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
    if (!food) return res.status(400).json({ error: "Food query is required" });

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search` +
        `?api_key=${process.env.USDA_API_KEY}` +
        `&query=${encodeURIComponent(food)}` +
        `&dataType=SR%20Legacy` +
        `&pageSize=50`, // fetch more so filtering has more to work with
    );

    const data = await response.json();

    const JUNK_TERMS = [
      "babyfood",
      "baby food",
      "infant",
      "toddler",
      "formula",
      "supplement",
      "vitamin",
      "meal, ready-to-eat",
      "military",
      "nfs",
    ];

    const BOOST_TERMS = ["raw", "fresh"];

    const PENALTY_TERMS = [
      "prepared with",
      "fast food",
      "restaurant",
      "commercial",
      "frozen meal",
      "dehydrated",
    ];

    const isJunk = (name) => {
      const lower = name.toLowerCase();
      return JUNK_TERMS.some((t) => lower.includes(t));
    };

    const toTitleCase = (str) =>
      str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const scoreFood = (name, query) => {
      const parts = name
        .toLowerCase()
        .split(",")
        .map((p) => p.trim());
      const primaryName = parts[0];
      const q = query.toLowerCase().trim();
      let score = 0;

      // Primary name match quality — this is the most important factor
      if (primaryName === q) score += 500;
      else if (primaryName.startsWith(q)) score += 300;
      else if (primaryName.includes(q)) score += 150;
      else if (name.toLowerCase().includes(q)) score += 20; // query only in modifiers — barely counts

      // If the query doesn't appear in the primary name at all, heavily punish
      if (!primaryName.includes(q)) score -= 200;

      // Simplicity — fewer commas = simpler = better
      score -= (parts.length - 1) * 40;

      // Prefer raw/whole foods
      if (parts.some((p) => p === "raw")) score += 80;
      if (parts.some((p) => p.includes("fresh"))) score += 40;

      // Punish clearly secondary foods
      if (!primaryName.includes(q) && parts.some((p) => p.includes(q)))
        score -= 100;

      return score;
    };

    const validFoods = (data.foods || []).filter((item) => {
      if (!item.foodNutrients?.length) return false;
      if (!["SR Legacy"].includes(item.dataType)) return false;

      const hasCalories = item.foodNutrients.some(
        (n) => n.nutrientName === "Energy" && n.value > 0,
      );
      const hasProtein = item.foodNutrients.some(
        (n) => n.nutrientName === "Protein" && n.value >= 0,
      );
      const hasCarbs = item.foodNutrients.some(
        (n) => n.nutrientName === "Carbohydrate, by difference" && n.value >= 0,
      );
      const hasFat = item.foodNutrients.some(
        (n) => n.nutrientName === "Total lipid (fat)" && n.value >= 0,
      );

      return hasCalories && hasProtein && hasCarbs && hasFat;
    });

    const foods = validFoods
      .filter((item) => !isJunk(item.description))
      .filter((item) => {
        // if the very first word of the primary name isn't related to the query, discard
        const primaryName = item.description.toLowerCase().split(",")[0].trim();
        return primaryName.includes(food.toLowerCase().trim());
      })
      .map((item) => ({
        id: item.fdcId,
        name: toTitleCase(item.description),
        score: scoreFood(item.description, food),
        calories:
          item.foodNutrients.find((n) => n.nutrientName === "Energy")?.value ||
          0,
        protein:
          item.foodNutrients.find((n) => n.nutrientName === "Protein")?.value ||
          0,
        carbs:
          item.foodNutrients.find(
            (n) => n.nutrientName === "Carbohydrate, by difference",
          )?.value || 0,
        fat:
          item.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")
            ?.value || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...rest }) => rest); // strip score before sending to client

    res.status(200).json(foods);
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ error: "Server error", errorMessage: err.message });
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

    // Guard against empty body (some USDA entries return nothing)
    const text = await response.text();
    if (!text || text.trim() === "") {
      return res.status(404).json({ error: "Food not found" });
    }
    const food = JSON.parse(text);

    let baseWeight = 100;
    if (food.servingSize) {
      baseWeight = food.servingSize;
    } else if (food.foodPortions?.length > 0) {
      baseWeight = food.foodPortions[0].gramWeight;
    }

    const getNutrient = (labelKey, nutrientNames) => {
      if (food.labelNutrients?.[labelKey]?.value != null) {
        return food.labelNutrients[labelKey].value;
      }
      const match = food.foodNutrients?.find((n) =>
        nutrientNames.includes(n.nutrient?.name),
      );
      return match?.amount ?? 0;
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
