import React from 'react'
import fullStar from '../../public/icons/full-star.png'
import halfStar from '../../public/icons/half-star.png'
import emptyStar from '../../public/icons/empty-star.png'
import Image from 'next/image' // bunu kullanmazsak yukarıdaki png leri typescript kabul etmiyor
import { calculateReviewRatingAverage } from '../../utils/calculateReviewRatingAverage'

import { Review } from '@prisma/client'

const Stars = ({ reviews,rating }: { reviews: Review[],rating?:number }) => {
  const reviewRating = rating || calculateReviewRatingAverage(reviews)

  // console.log(rating);  // 3.6, 4.5, 2.1 , etc

  const renderStar = () => {
    const stars = []

    for (let i = 0; i < 5; i++) {
      const difference = parseFloat((reviewRating - i).toFixed(1))
      // console.log('differance', difference)
      if (difference >= 1) stars.push(fullStar)
      else if (difference < 1 && difference > 0) {
        if (difference <= 0.2) stars.push(emptyStar)
        else if (difference > 0.2 && difference <= 0.6) stars.push(halfStar)
        else stars.push(fullStar)
      }
      else stars.push(emptyStar)
    }
    return stars.map((star)=>{
     return <Image src={star} alt='' className='w-4 h-4 mr-1' />
    })
  }
 
  return (
    <div className='flex items-center'>
     {renderStar()}
    </div>
  )
}

export default Stars
