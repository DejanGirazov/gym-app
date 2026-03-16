import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SignUpPage from './pages/SignUpPage.jsx'
import LogInPage from './pages/LogInPage.jsx'
import CreateWorkoutPage from './pages/CreateWorkoutPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import StartWorkoutPage from './pages/StartWorkoutPage.jsx'
import NavPage from './pages/NavPage.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import Header from './components/Header.jsx'
import NavBar from './components/NavBar.jsx'



function App() {
// const {data: authUser, isLoading}= useQuery({
//   queryKey:["authUser"], 
//   queryFn: async ()=>{
//     try{
//       const res = await fetch("/api/auth/me");
//       const data = await res.json();
//       if(data.error){
//         return null;
//       }
//       if(!res.ok || data.error){
//         throw new Error(data.error || "Failed to fetch user data");
//       }
//       console.log("Fetched user data:", data);
//       return data;
//     }
//     catch(err){
//       throw new Error(err);
//     }
//   }, retry: false,
// })
 const isLoading = false;
 const authUser = true


  if(isLoading){
    return <div className='h-screen flex justify-center items-center'>
    <LoadingSpinner size="lg" />

    </div>
  }

 return (<div>
    <Header/>
    <Routes>
      <Route path= '/' element={authUser ? <NavPage/>: <Navigate to="/login"/>}></Route>
      <Route path= '/createWorkout' element={authUser ? <CreateWorkoutPage/>: <Navigate to="/login"/>}></Route>   
      <Route path= '/startWorkout' element={authUser ? <StartWorkoutPage/>: <Navigate to="/login"/>}></Route>   
      <Route path= '/stats' element={authUser ? <StatsPage/>: <Navigate to="/login"/>}></Route>   
      <Route path= '/login' element={!authUser ? <LogInPage/>: <Navigate to='/'/>}></Route> 
      <Route path= '/signUp' element={!authUser ? <SignUpPage/>: <Navigate to="/"/>}></Route>   

    </Routes>
    {authUser && <NavBar/>}

  
 </div>)
}

export default App
