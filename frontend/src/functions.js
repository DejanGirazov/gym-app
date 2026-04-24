const getWorkouts = async () => {
  try {
    const res = await fetch("/api/workout/getWorkouts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch workouts");
    }
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getLogs = async () => {
  try {
    const res = await fetch("/api/workout/getLogs");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch logs");
    }
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const generateCalendarData = (logs) => {
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01`);
  const today = new Date();
  const workoutDates = new Set(
    logs?.map((log) => new Date(log.createdAt).toISOString().split("T")[0]),
  );

  const data = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    data.push({
      date: dateStr,
      count: workoutDates.has(dateStr) ? 1 : 0,
      level: workoutDates.has(dateStr) ? 1 : 0,
    });
  }
  return data;
};

export { getWorkouts, getLogs };
