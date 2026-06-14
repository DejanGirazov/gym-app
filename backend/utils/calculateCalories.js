const MET_VALUES = {
  running: 9.8,
  cycling: 7.5,
  walking: 3.5,
  hiking: 6.0,
  swimming: 8.0,
  hiit: 10.0,
};

const calculateCalories = (type, duration, weight, distance) => {
  const normalizedType = type.toLowerCase();

  // Distance-based calculation (kcal = kg * km * constant) for activities where distance is meaningful
  if (distance && distance > 0 && ["running", "walking", "hiking", "cycling"].includes(normalizedType)) {
    const constants = {
      running: 1.036,
      walking: 0.83,
      hiking: 0.94,
      cycling: 0.48,
    };
    return Math.round(weight * distance * (constants[normalizedType] || 1.0));
  }

  // MET-based fallback for everything else (or when no distance provided)
  const met = MET_VALUES[normalizedType] || 5;
  return Math.round(met * weight * (duration / 60));
};

export default calculateCalories;