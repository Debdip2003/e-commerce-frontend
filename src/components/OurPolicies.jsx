import React from 'react'
import { assets } from '../assets/frontend_assets/assets'

const OurPolicies = () => {
  return (
    <div className='py-20'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold mb-3'>Why Shop With Us</h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          We're committed to providing you with the best shopping experience
        </p>
      </div>
      
      <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center text-xs sm:text-sm md:text-base text-gray-700'>
      <div>
        <img src={assets.exchange_icon} alt='exchange_icon' className='w-12 m-auto mb-5'/>
        <p className='font-semibold'>Easy Excahnge Policy</p>
        <p className='text-gray-400'>We offer hassle free exchange policies</p>
      </div>
      <div>
        <img src={assets.quality_icon} alt='quality_icon' className='w-12 m-auto mb-5'/>
        <p className='font-semibold'>7 Days Return Pollicy</p>
        <p className='text-gray-400'>We provide 7 days free return policy</p>
      </div>
      <div>
        <img src={assets.support_img} alt='support_icon' className='w-12 m-auto mb-5'/>
        <p className='font-semibold'>Best Customer Support</p>
        <p className='text-gray-400'>We provide 24/7 customer support</p>
      </div>
    </div>
    </div>
  )
}

export default OurPolicies
