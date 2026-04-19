import React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getWorkouts } from "../functions";
import { StopWatch, Timer } from "../components/watch";
import { IoMdClose } from "react-icons/io";
import { MdOutlineDone } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const StartWorkoutPage = () => {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editedExercises, setEditedExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTime, setRestTime] = useState(120);
  const [totalTime, setTotalTime] = useState(0);
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });
  const { mutate: finishWorkout } = useMutation({
    mutationFn: async ({
      totalReps,
      totalWeight,
      totalTime,
      exercises: editedExercises,
    }) => {
      try {
        const res = await fetch(
          `/api/workout/updateLogs/${selectedWorkout._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              totalReps,
              totalWeight,
              totalTime,
              exercises: editedExercises,
            }),
          },
        );
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to update workout logs");
        }

        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log("Workout logs updated successfully");
      setSelectedWorkout(null);
      setCurrentExerciseIndex(0);
    },
  });
  const handleFinishWorkout = () => {
    const totalReps = editedExercises.reduce((total, exercise) => {
      return (
        total + exercise.sets.reduce((sum, set) => sum + Number(set.reps), 0)
      );
    }, 0);

    const totalWeight = editedExercises.reduce((total, exercise) => {
      return (
        total + exercise.sets.reduce((sum, set) => sum + Number(set.weight), 0)
      );
    }, 0);

    finishWorkout({
      totalReps,
      totalWeight,
      totalTime,
      exercises: editedExercises})
  };

  return (
    <div className="h-screen w-full flex items-center justify-start flex-col">
      {!selectedWorkout && (
        <div>
          <label>Choose one of your workouts:</label>
          <div className="dropdown dropdown-hover">
            <div tabIndex={0} role="button" className="btn m-1">
              Workout
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
                      setEditedExercises(workout.exercises); // add this line
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
        <div className="w-full flex justify-between gap-4">
          <StopWatch shouldStart={selectedWorkout} onTimeUpdate={setTotalTime} />
          <div className="flex flex-col items-center justify-between w-100">
            <label>
              Enter rest time (seconds):
              <input
                type="number"
                className="w-20 input"
                value={restTime === 0 ? "" : restTime}
                onChange={(e) => setRestTime(parseInt(e.target.value) || 0)}
              ></input>
            </label>
            <Timer expirySeconds={restTime} />
          </div>
        </div>
      )}
      {selectedWorkout && editedExercises.length > 0 && (
        <div className="flex flex-col justify-center items-center">
          <h3 className="font-bold text-lg mb-4 w-full text-left">
            {selectedWorkout?.title}
          </h3>
          <div className="bg-blue-950 p-3 rounded">
            <h3 className="font-bold text-md mb-2">
              {editedExercises[currentExerciseIndex]?.exerciseName}
            </h3>
            {editedExercises[currentExerciseIndex]?.sets.map(
              (set, setIndex) => (
                <div key={setIndex} className="flex gap-4 mt-2 items-center">
                  <p>Set {setIndex + 1}</p>
                  <p>
                    Reps:{" "}
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => {
                        const updated = [...editedExercises];
                        updated[currentExerciseIndex].sets[setIndex].reps =
                          e.target.value;
                        setEditedExercises(updated);
                      }}
                      className="input w-15 h-8"
                    />
                  </p>
                  <p>
                    Weight:{" "}
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => {
                        const updated = [...editedExercises];
                        updated[currentExerciseIndex].sets[setIndex].weight =
                          e.target.value;
                        setEditedExercises(updated);
                      }}
                      className="input w-15 h-8"
                    />{" "}
                    Kg
                  </p>
                  <button
                    className="btn btn-sm bg-red-600"
                    onClick={() => {
                      const updated = [...editedExercises];
                      updated[currentExerciseIndex].sets.splice(setIndex, 1);
                      setEditedExercises(updated);
                    }}
                  >
                    <MdDelete />
                  </button>
                </div>
              ),
            )}
            <div className="flex gap-4 mt-2 items-center justify-center">
              <button
                className="btn btn-sm mt-2 w-full"
                onClick={() => {
                  const updated = [...editedExercises];
                  updated[currentExerciseIndex].sets.push({
                    reps: 0,
                    weight: 0,
                  });
                  setEditedExercises(updated);
                }}
              >
                + Add Set
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-4 items-center">
            <button
              className="btn"
              onClick={() => setCurrentExerciseIndex((i) => i - 1)}
              disabled={currentExerciseIndex === 0}
            >
              Previous
            </button>
            <p>
              {currentExerciseIndex + 1} / {editedExercises.length}
            </p>
            <button
              className="btn"
              onClick={() => setCurrentExerciseIndex((i) => i + 1)}
              disabled={currentExerciseIndex === editedExercises.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {selectedWorkout && (
        <div className="flex justify-between gap-15">
          <button
            className="btn bg-red-600"
            onClick={() => {
              setSelectedWorkout(null);
              setCurrentExerciseIndex(0);
            }}
          >
            <IoMdClose /> Close Workout
          </button>
          <button
            className="btn bg-green-600"
            onClick={() => {
              handleFinishWorkout();
            }}
          >
            <MdOutlineDone /> Finish Workout
          </button>
        </div>
      )}
    </div>
  );
};

export default StartWorkoutPage;
