import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLogs, getWorkouts, generateCalendarData } from "../functions";
import { useState } from "react";
import WorkoutChart from "../components/WorkoutChart";
import { ActivityCalendar } from "react-activity-calendar";

const StatsPage = () => {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [tab, setTab] = useState("weight");
  const [expandedLog, setExpandedLog] = useState(null);

  const { data: logs } = useQuery({
    queryKey: ["logs"],
    queryFn: getLogs,
  });
  const totalWeight = logs?.reduce((sum, log) => sum + log.totalWeight, 0) || 0;
  const totalReps = logs?.reduce((sum, log) => sum + log.totalReps, 0) || 0;
  const totalTime = logs?.reduce((sum, log) => sum + log.totalTime, 0) || 0;
  const totalWorkouts = logs?.length || 0;
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });
  const calendarData = generateCalendarData(logs);
  const recentWorkouts = logs?.slice(-5).reverse();
  const getWorkoutName = (workoutId) => {
    return workouts?.find((w) => w._id === workoutId)?.title || "Unknown";
  };
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hours}:${mins}:${secs}`;
  };

  return (
    <div className="w-full h-screen">
      <div className="flex justify-around m-10">
        <div className="h-40 w-40 bg-cyan-900 rounded-xl flex flex-col align-center justify-center text-center border-l-4 border-b-4 border-cyan-700">
          <h4>Total wight lifted</h4>
          <p className="text-3xl">{totalWeight}kg</p>
        </div>
        <div className="h-40 w-40 bg-cyan-900 rounded-xl flex flex-col align-center justify-center text-center border-l-4 border-b-4 border-cyan-700">
          <h4>Total reps</h4>
          <p className="text-3xl">{totalReps}</p>
        </div>
        <div className="h-40 w-40 bg-cyan-900 rounded-xl flex flex-col align-center justify-center text-center border-l-4 border-b-4 border-cyan-700">
          <h4>Total time spent lifting</h4>
          <p className="text-3xl">{formatTime(totalTime)}</p>
        </div>
        <div className="h-40 w-40 bg-cyan-900 rounded-xl flex flex-col align-center justify-center text-center border-l-4 border-b-4 border-cyan-700">
          <h4>Number of workouts</h4>
          <p className="text-3xl">{totalWorkouts}</p>
        </div>
      </div>
      <div className="flex justify-evenly mt-60 items-start">
        <div>
          {!selectedWorkout && (
            <div className="flex flex-col items-center ">
              <h1 className="text-lg font-bold">
                Choose one of your workouts to see your progress
              </h1>{" "}
              <div className="dropdown dropdown-hover">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn bg-cyan-900 border-cyan-700 w-48 m-1"
                >
                  Choose Workout
                </div>
                <ul
                  tabIndex="-1"
                  className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                >
                  {isLoading ? (
                    <li>Loading...</li>
                  ) : (
                    workouts.map((workout) => (
                      <li
                        key={workout._id}
                        onClick={() => {
                          setSelectedWorkout(workout);
                        }}
                      >
                        <p>{workout.title}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {selectedWorkout && (
            <div className="flex flex-col justify-center items-center">
              <h3 className="text-xl mb-5">Your progress over time</h3>
              <WorkoutChart
                logs={logs}
                selectedWorkout={selectedWorkout}
                tab={tab}
              />
              <div className="flex gap-2 mb-4">
                <button
                  className={`btn ${tab === "weight" ? "bg-cyan-900" : ""}`}
                  onClick={() => setTab("weight")}
                >
                  Weight
                </button>
                <button
                  className={`btn ${tab === "reps" ? "bg-cyan-900" : ""}`}
                  onClick={() => setTab("reps")}
                >
                  Reps
                </button>
                <button
                  className="btn"
                  onClick={() => setSelectedWorkout(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        {calendarData && calendarData.length > 0 && (
          <div className="flex flex-col justify-center items-center gap-5">
            <h3 className="text-xl">Your consistency</h3>
            <ActivityCalendar
              data={calendarData}
              colorScheme="light"
              theme={{
                light: ["#e2e8f0", "#0e7490"],
              }}
              maxLevel={1}
              labels={{
                legend: {
                  less: "Not worked",
                  more: "Worked",
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center items-center mt-40">
        <h2 className="text-2xl font-bold mb-4 ">Last 5 workouts</h2>
        {recentWorkouts &&
          recentWorkouts.length > 0 &&
          recentWorkouts?.map((workout) => (
            <div
              key={workout._id}
              className="flex flex-col bg-cyan-900 rounded-xl p-4 mb-3 w-full border-l-4 border-cyan-600 cursor-pointer hover:bg-cyan-700"
              onClick={() =>
                setExpandedLog(expandedLog === workout._id ? null : workout._id)
              }
            >
              <div className="flex gap-6 items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {getWorkoutName(workout.workout)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p>{formatTime(workout.totalTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Weight</p>
                    <p>{workout.totalWeight}kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Reps</p>
                    <p>{workout.totalReps}</p>
                  </div>
                </div>
              </div>

              {expandedLog === workout._id && (
                <div className="mt-4 grid grid-cols-4">
                  {workout.exercises.map((exercise, i) => (
                    <div key={i} className="mb-3">
                      <p className="font-bold">{exercise.exerciseName}</p>
                      {exercise.sets.map((set, j) => (
                        <p key={j} className="text-sm text-gray-300">
                          Set {j + 1}: {set.reps} reps  {set.weight}kg
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default StatsPage;
