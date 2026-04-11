import {Link} from 'react-router-dom'
import gymPhoto from '../assets/hero.jpg'


const NavPage = () => {
  return (
    <div className='min-h-screen flex justify-around items-center ' >
      <div className='text-center flex flex-col gap-6 items-ceter justify-between'>
        <h1 className='text-6xl max-w-xl'>Welcome to FitPro! TRAIN SMARTER GET STRONGER</h1>
        <div className='flex flex-col items-center justify-center font-sans'>
          <Link to='/startWorkout' ><button className='btn bg-blue-800 hover:bg-blue-900 text-lg text-white border-none rounded-2xl mt-5 h-16 w-41'>Start Workout</button></Link>
          <Link to='/createWorkout' ><button className='btn bg-blue-800 hover:bg-blue-900 text-lg text-white border-none rounded-2xl mt-5 h-16 w-41'>Create Workout</button></Link>
          <Link to='/stats' ><button className='btn bg-blue-800 hover:bg-blue-900 text-lg text-white border-none rounded-2xl mt-5 h-16 w-41'>View Stats</button></Link>
        </div>
      </div>
      <img src={gymPhoto} alt="Gym" className='h-150 rounded-xl  '/>
    </div> 
  )
}

export default NavPage