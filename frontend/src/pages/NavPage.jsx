import {Link} from 'react-router-dom'

const NavPage = () => {
  return (
    <div className='flex flex-col gap-20 justify-center items-center h-150 w-full' >
    <Link to='createWorkout'> <button style={{borderLeft: '4px solid #1064ad'}} className='bg-[#111] text-white w-72  uppercase tracking-widest text-sm hover:scale-105 hover:-translate-y-1 hover:bg-[#1064ad] transition-all rounded-2xl p-8' >CREATE WORKOUT</button></Link>
    <Link to='startWorkout'><button style={{borderLeft: '4px solid #1064ad'}} className='bg-[#111] text-white w-72 uppercase tracking-widest text-sm hover:scale-105 hover:-translate-y-1 hover:bg-[#1064ad] transition-all rounded-2xl p-8' >START WORKOUT</button></Link>
    <Link to='stats'><button style={{borderLeft: '4px solid #1064ad'}} className='bg-[#111] text-white w-72  uppercase tracking-widest text-sm hover:scale-105 hover:-translate-y-1 hover:bg-[#1064ad] transition-all rounded-2xl p-8'>WORKOUT STATS</button>
    </Link>
  
    </div> 

   
  )
}

export default NavPage