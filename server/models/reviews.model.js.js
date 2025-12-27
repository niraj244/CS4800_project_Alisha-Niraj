import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({
    image : {
        type : String,
        default : '',
    },
    userName : {
        type : String,
        default : '',
    },
    review : {
        type : String,
        default : '',
    },
    rating : {
        type : Number,
        default : 0,
        min: 0,
        max: 5,
    },
    userId : {
        type : String,
        default : '',
    },
    productId : {
        type : String,
        default : '',
    },
    reviewImages : {
        type : [String],
        default : [],
    },
},{
    timestamps : true
});

const ReviewModel = mongoose.model('reviews',reviewsSchema)

export default ReviewModel