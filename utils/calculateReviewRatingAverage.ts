import {Review} from "@prisma/client"

export const calculateReviewRatingAverage = (reviews:Review[]) => {
  return reviews.reduce((sum,review)=>{
    if(!reviews.length) return 0
    return sum + review.rating
  },0)/reviews.length
}


