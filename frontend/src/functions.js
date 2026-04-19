

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



export { getWorkouts };