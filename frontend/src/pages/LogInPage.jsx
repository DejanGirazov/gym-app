import React from 'react'
import Logo from '../assets/Logo.png'
import {useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import { toast } from "react-hot-toast";
import { Link } from 'react-router-dom';

const LogInPage = () => {
const [formData, setFormData] = useState({username: "", password: ""});
const queryClient = useQueryClient();

const {mutate, isPending} = useMutation({
    mutationFn: async ({username, password}) => {
        
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (data.error){ throw new Error(data.error)} ;
            return data;
        
       
    },onSuccess: ()=>{
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }, onError :(err)=>{
        toast.error(err.message);
    }
})



  const handleData = (e)=>{
    e.preventDefault();
    mutate(formData);
  }



  return (
    <div className='flex w-full h-screen justify-around items-center '>
    <img src={Logo} alt='logo' className='h-100'/>
    <div className='flex flex-col gap-4 w-90 items-center'>
      <h1 className='font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-300 bg-clip-text text-transparent py-4 tracking-widest'>LOG IN TO FITPRO</h1>
     <form onSubmit={handleData} className='flex flex-col items-center gap-4'>
      <input type="text" placeholder="Username" className="input input-primary "  onChange={(e) => setFormData({...formData, username: e.target.value})} value={formData.username}/>
      <input type="password" placeholder="Password" className="input input-primary" onChange={(e) => setFormData({...formData, password: e.target.value})} value={formData.password} />
      <button  type='submit'  className='bg-[#111] text-white w-72  uppercase tracking-widest text-sm hover:scale-105 hover:-translate-y-1 hover:bg-[#1064ad] transition-all rounded-2xl p-5' >
        {isPending ? "Loading..." : "Log In"}
      </button>
      </form>
      <p>Don't have an account?<Link to="/signup" className='font-bold  bg-gradient-to-r from-blue-600 to-cyan-300 bg-clip-text text-transparent'>Sign up</Link></p>
    </div>
    
    


    </div>
  )
}

export default LogInPage