import calculateCalories from "./calculateCalories.js";

describe("calculateCalories", () => {
  it("uses distance-based formula for running when distance is given", () => {
    const result = calculateCalories("running", 1800, 70, 5);
    // weight * distance * constant = 70 * 5 * 1.036
    expect(result).toBe(Math.round(70 * 5 * 1.036));
  });
  it("uses distance-based formula for walking when distance is given", () => {
    const result = calculateCalories("walking", 1800, 70, 5);
    // weight * distance * constant = 70 * 5 * 0.83
    expect(result).toBe(Math.round(70 * 5 * 0.83));
  });

  it("falls back to MET formula when no distance is given", () => {
    const result = calculateCalories("swimming", 1800, 70);
    // met * weight * (duration/60) = 8.0 * 70 * 30
    expect(result).toBe(Math.round(8.0 * 70 * (1800 / 60)));
  });

  it("defaults to MET 5 for an unknown activity type", () => {
    const result = calculateCalories("underwater basket weaving", 600, 70);
    expect(result).toBe(Math.round(5 * 70 * (600 / 60)));
  });

  it("is case-insensitive on the type", () => {
    const a = calculateCalories("Running", 1800, 70, 5);
    const b = calculateCalories("running", 1800, 70, 5);
    expect(a).toBe(b);
  });
});