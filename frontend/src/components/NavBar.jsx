import React from 'react'
import { MdOutlineLogout } from "react-icons/md";
import { IoMdCreate } from "react-icons/io";
import { IoStatsChart } from "react-icons/io5";
import { FaHourglassStart } from "react-icons/fa6";
import { Link } from 'react-router-dom'; 
import {useMutation, useQueryClient} from '@tanstack/react-query' 
import { toast } from "react-hot-toast";

const SideBar = () => {
  const queryClient = useQueryClient();

const {mutate: Logout, isPending:isLoading} = useMutation({
  mutationFn: async ()=>{
    const res = await fetch("/api/auth/logout",{
      method:"POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    if(data.error){
      throw new Error(data.error);
    }
    return data;
  },
  onSuccess: ()=>{
   queryClient.invalidateQueries({ queryKey: ["authUser"] });
  },
  onError: (err)=>{
    toast.error(err.message, {
      duration: 3000
    })

  }
})

  const handleLogout=()=>{
    Logout();
  }

  return (

  <div className="navbar bg-black/35 justify-around fixed bottom-0 left-0 right-0 h-10">
  <div >
    <Link to='/startWorkout' className="btn btn-ghost text-xl"><FaHourglassStart className='h-50'/>
    <label>Start Workout</label>
    </Link>
    
  </div>
  <div >
    <Link to= '/stats' className="btn btn-ghost text-xl">
     <IoStatsChart className='h-50'/>
     <label>Stats</label>
    </Link>
    
  </div>
  <div >
    <Link to='/createWorkout' className="btn btn-ghost text-xl">
     <IoMdCreate className='h-50'/>
     <label>Create Workout</label>
    </Link>
    
  </div>
   <div >
    <button className="btn btn-ghost text-xl" onClick={handleLogout}>
     <MdOutlineLogout className='h-50'/>
     <label>
      {isLoading ? "Logging out..." : "Logout"}
     </label>
    </button>
  </div>
</div>
  
 
  )
}

export default SideBar