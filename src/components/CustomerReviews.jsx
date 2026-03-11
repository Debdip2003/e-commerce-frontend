import React, { useEffect, useState } from 'react'
import api from '../services/axiosInstance';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => { 
        getCustomerreviews()
    }, [])

    const getCustomerreviews = async() =>{
        try{
            const response = await api.get("/customer-reviews");
            if(response.data){
                setReviews(response.data);
            } else {
                console.error("Failed to fetch reviews");
            }
        }catch(error){
            console.error(error);
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <svg
                key={index}
                className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))
    }

    const settings = {
        dots: false,
        infinite: reviews.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <div className='mb-14'>
            <div className='text-center mb-12'>
                <h2 className='text-3xl font-bold mb-3'>What Our Customers Say</h2>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                    Don't just take our word for it - hear from some of our satisfied customers
                </p>
            </div>

            <div className='px-4 md:px-12 lg:px-16'>
                <Slider {...settings}>
                    {reviews.map((review) => (
                        <div key={review._id} className='px-3 py-2'>
                            <div className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm  h-[250px] flex flex-col justify-between hover:cursor-pointer'>
                                <div>
                                    <div className='flex items-center mb-6'>
                                        <div className='w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0'>
                                            {review.user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className='ml-4 overflow-hidden'>
                                            <h3 className='font-semibold text-gray-800 text-lg truncate'>{review.user.name}</h3>
                                            {review.product && (
                                                <p className='text-sm text-gray-500 mt-1 truncate'>{review.product.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className='flex mb-4'>
                                        {renderStars(review.rating)}
                                    </div>
                                    
                                    <p className='text-gray-600 text-base leading-relaxed line-clamp-4'>
                                        "{review.comment}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    )
}

export default CustomerReviews
