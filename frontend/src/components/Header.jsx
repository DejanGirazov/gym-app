import React from 'react'
import {Link} from 'react-router-dom'
import Logo from '../assets/Logo.png'
const Header = () => {
  return (
    <div className='flex justify-around items-center '>
    <Link to='/'><img href='./assets/Logo.png' src={Logo} alt='logo' className='h-50'/></Link>
   <Link to='/'><div className=' font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-300 bg-clip-text text-transparent py-4 tracking-widest'>FITPRO-EVERY REP COUNTS</div></Link>
    
     </div>
  )
}

export default Header