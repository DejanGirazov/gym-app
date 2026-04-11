import React from "react";
import { useQuery, useMutation , useQueryClient} from "@tanstack/react-query";
import { IoIosCreate } from "react-icons/io";
import { useState } from "react";
import exercises from "../data/exercises.json";

const CreateWorkoutPage = () => {
  const [searchExercise, setSearchExercise] = useState("");
  const queryClient = useQueryClient()
  const [submitted, setSubmitted] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
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
    queryFn: async () => {
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

        return data; // OK
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  });


  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchExercise.toLowerCase()),
  );
  const handleAddExercises = () => {
    const formattedExercises = selectedExercises.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
    }))
    createWorkout({ title: workoutTitle, exercises: formattedExercises });
  };
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
          workouts.map((workout) => (
            <div
              key={workout._id}
              className="bg-gray-800 p-4 rounded mb-4 hover:bg-blue-900 transition cursor-pointer w-250"
            >
              <p>{workout.title}</p>
            </div>
          ))
        )}

        <button
          className="btn bg-gray-800 p-4 rounded mb-4 hover:bg-blue-900 transition cursor-pointer w-250"
          onClick={() => document.getElementById("my_modal_1").showModal()}
        >
          Create Workout <IoIosCreate />
        </button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            {/* Title input at top */}
            <h3 className="font-bold text-lg mb-4">Create New Workout</h3>

            <input
              type="text"
              placeholder="Workout Title e.g. Push Day"
              className="input input-bordered w-full mb-6"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
            />

            {/* Divider */}
            <div className="divider">Select Exercises</div>

            <input
              type="text"
              placeholder="Workout Name"
              className="input input-bordered w-full mb-4"
              value={searchExercise}
              onChange={(e) => setSearchExercise(e.target.value)}
            />
            <>
              {
                <ul className="w-full list-exercises">
                  {filteredExercises.map((exercise) => (
                    <li key={exercise.id} className="p-3 mb-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          onChange={() => {
                            if (
                              selectedExercises.some(
                                (ex) => ex.id === exercise.id,
                              )
                            ) {
                              setSelectedExercises(
                                selectedExercises.filter(
                                  (ex) => ex.id !== exercise.id,
                                ),
                              );
                            } else {
                              setSelectedExercises([
                                ...selectedExercises,
                                exercise,
                              ]);
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
              }
            </>
            {submitted && !workoutTitle && (
              <p className="text-red-500 mt-2 error">
                Please enter a workout title.
              </p>
            )}
            {submitted && selectedExercises.length === 0 && (
              <p className="text-red-500 mt-2 error">
                Please select at least one exercise.
              </p>
            )}
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <div className="flex justify-between gap-4">
                  <button className="btn">Close</button>
                </div>
              </form>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSubmitted(true);
                  if (!workoutTitle || selectedExercises.length === 0) return;
                  handleAddExercises();
                  document.getElementById("my_modal_1").close(); // manually close
                }}
              >
                Create Workout
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </>
  );
};

export default CreateWorkoutPage;
