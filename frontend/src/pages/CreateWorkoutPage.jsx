import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoIosCreate } from "react-icons/io";
import { useState } from "react";
import exercises from "../data/exercises.json";
import { MdDelete } from "react-icons/md";
import { getWorkouts } from "../functions";

const CreateWorkoutPage = () => {
  const [searchExercise, setSearchExercise] = useState("");
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [editedExercises, setEditedExercises] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const { mutate: createWorkout } = useMutation({
    mutationFn: async ({ title, exercises }) => {
      try {
        const res = await fetch("/api/workout/newWorkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, exercises }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setWorkoutTitle("");
      setSelectedExercises([]);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const {
    data: workouts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchExercise.toLowerCase()),
  );

  const handleAddExercises = () => {
    const formattedExercises = selectedExercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: [{ reps: 0, weight: 0 }]
    }));
    createWorkout({ title: workoutTitle, exercises: formattedExercises });
  };
  const { mutate: updateWorkout } = useMutation({
    mutationFn: async ({ exercises }) => {
      try {
        const res = await fetch(
          `/api/workout/updateWorkout/${selectedWorkout._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ exercises }),
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      document.getElementById("edit_modal").close();
    },
  });
  const { mutate: deleteWorkout } = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await fetch(`/api/workout/deleteWorkout/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  return (
    <>
      {isError && (
        <p className="text-red-500">
          Failed to load workouts. Please try again later.
        </p>
      )}
      {workouts && workouts.length === 0 && (
        <p>No workouts found. Create your first workout!</p>
      )}

      <div className="flex flex-col items-center justify-center mt-8">
        {isLoading ? (
          <p>Loading workouts...</p>
        ) : (
          workouts?.map((workout) => (
            <div
              key={workout._id}
              className="flex justify-between items-center bg-gray-800 p-4 rounded mb-4 hover:bg-blue-900 transition w-250"
            >
              <p>{workout.title}</p>
              <div className="flex gap-2">
                <button
                  className="btn"
                  onClick={() => {
                    setSelectedWorkout(workout);
                    setEditedExercises(workout.exercises);
                    document.getElementById("edit_modal").showModal();
                  }}
                >
                  Edit Workout
                </button>
                <button
                  className="btn bg-red-600"
                  onClick={() => deleteWorkout(workout._id)}
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))
        )}

        <button
          className="btn bg-gray-800 p-4 rounded mb-4 hover:bg-blue-900 transition cursor-pointer w-250"
          onClick={() => document.getElementById("my_modal_1").showModal()}
        >
          Create Workout <IoIosCreate />
        </button>
      </div>

      {/* Edit Modal - outside the map */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">{selectedWorkout?.title}</h3>
          {editedExercises.map((exercise, index) => (
            <div
              key={exercise._id}
              className="flex items-center gap-3 mb-2 bg-blue-950 p-3 rounded"
            >
              <div className="flex flex-col w-full">
                <p>{exercise.exerciseName}</p>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex gap-4 mt-2 items-center">
                    <p>Set {setIndex + 1}</p>
                    <p>
                      Reps:{" "}
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => {
                          const updated = [...editedExercises];
                          updated[index].sets[setIndex].reps = e.target.value;
                          setEditedExercises(updated);
                        }}
                        className="input w-15 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </p>
                    <p>
                      Weight:{" "}
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => {
                          const updated = [...editedExercises];
                          updated[index].sets[setIndex].weight = e.target.value;
                          setEditedExercises(updated);
                        }}
                        className="input w-15 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />{" "}
                      Kg
                    </p>
                    <button
                      className="btn btn-sm bg-red-600"
                      onClick={() => {
                        const updated = [...editedExercises];
                        updated[index].sets.splice(setIndex, 1);
                        setEditedExercises(updated);
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-sm mt-2"
                  onClick={() => {
                    const updated = [...editedExercises];
                    updated[index].sets.push({ reps: 0, weight: 0 });
                    setEditedExercises(updated);
                  }}
                >
                  + Add Set
                </button>
              </div>
            </div>
          ))}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
            <button
              className="btn btn-primary"
              onClick={() => updateWorkout({ exercises: editedExercises })}
            >
              Save Changes
            </button>
          </div>
        </div>
      </dialog>

      {/* Create Workout Modal */}
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Workout</h3>

          <input
            type="text"
            placeholder="Workout Title e.g. Push Day"
            className="input input-bordered w-full mb-6"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
          />

          <div className="divider">Select Exercises</div>

          <input
            type="text"
            placeholder="Search exercises..."
            className="input input-bordered w-full mb-4"
            value={searchExercise}
            onChange={(e) => setSearchExercise(e.target.value)}
          />

          <ul className="w-full">
            {filteredExercises.map((exercise) => (
              <li key={exercise.id} className="p-3 mb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    onChange={() => {
                      if (
                        selectedExercises.some((ex) => ex.id === exercise.id)
                      ) {
                        setSelectedExercises(
                          selectedExercises.filter(
                            (ex) => ex.id !== exercise.id,
                          ),
                        );
                      } else {
                        setSelectedExercises([...selectedExercises, exercise]);
                      }
                    }}
                    checked={selectedExercises.some(
                      (ex) => ex.id === exercise.id,
                    )}
                  />
                  {exercise.name}
                </label>
              </li>
            ))}
          </ul>

          {submitted && !workoutTitle && (
            <p className="text-red-500 mt-2">Please enter a workout title.</p>
          )}
          {submitted && selectedExercises.length === 0 && (
            <p className="text-red-500 mt-2">
              Please select at least one exercise.
            </p>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!workoutTitle || selectedExercises.length === 0) {
                  setSubmitted(true);
                  return;
                }
                handleAddExercises();
                document.getElementById("my_modal_1").close();
              }}
            >
              Create Workout
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default CreateWorkoutPage;
