import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const WorkoutChart = ({ logs, selectedWorkout, tab }) => {


  const chartData = logs
    ?.filter((log) => log.workout === selectedWorkout?._id)
    .map((log) => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      weight: log.totalWeight,
      reps: log.totalReps,
    }));

  return (
    <>
    {chartData.length === 0 && <p className="text-center">No data available</p>}
    {chartData.length  < 3  && chartData.length > 0  && <p className="text-center">Complete at least 3 workouts to view chart</p>}
    {chartData.length  >= 3  && <ResponsiveContainer width="600" height={200}>
      <LineChart data={chartData} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Line type="linear" dataKey={tab} stroke="#06b6d4" strokeWidth={3}/>{" "}
      </LineChart>
    </ResponsiveContainer>}
    </>
  );
  
};

export default WorkoutChart;
