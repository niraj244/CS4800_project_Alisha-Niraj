import React, { useContext, useEffect, useState } from 'react'
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { MyContext } from '../../App';
import { fetchDataFromApi, postData, deleteData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { MdDelete } from 'react-icons/md';
import { MdClose } from 'react-icons/md';
import { FaImage } from 'react-icons/fa';
import axios from 'axios';
export const Reviews = (props) => {

    const [reviews, setReviews] = useState({
        image: '',
        userName: '',
        review: '',
        rating: 1,
        userId: '',
        productId: ''
    });

    const [loading, setLoading] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [reviewsData, setReviewsData] = useState([])

    const context = useContext(MyContext);

    useEffect(() => {
        setReviews(() => ({
            ...reviews,
            image: context?.userData?.avatar,
            userName: context?.userData?.name,
            userId: context?.userData?._id,
            productId: props?.productId
        }))

        getReviews();
    }, [context?.userData, props]);


    const onChangeInput = (e) => {
        setReviews(() => ({
            ...reviews,
            review: e.target.value
        }))
    }


    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValidType = file.type === "image/jpeg" || file.type === "image/jpg" || 
                               file.type === "image/png" || file.type === "image/webp";
            if (!isValidType) {
                context.alertBox("error", "Please select valid image files (JPG, PNG, or WEBP)");
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedImages(prev => [...prev, ...validFiles]);
            
            // Create previews
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }

    const uploadReviewImages = async () => {
        if (selectedImages.length === 0) {
            return [];
        }

        setUploadingImages(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const formData = new FormData();
            
            selectedImages.forEach((image) => {
                formData.append('reviewImages', image);
            });

            const response = await axios.post(apiUrl + '/api/user/uploadReviewImages', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response?.data?.images) {
                return response.data.images;
            }
            return [];
        } catch (error) {
            context.alertBox("error", "Failed to upload images");
            return [];
        } finally {
            setUploadingImages(false);
        }
    }

    const addReview = async (e) => {
        e.preventDefault();

        if (reviews?.review !== "") {
            setLoading(true);
            
            // Upload images first if any
            let uploadedImageUrls = [];
            if (selectedImages.length > 0) {
                uploadedImageUrls = await uploadReviewImages();
            }

            // Submit review with image URLs
            const reviewData = {
                ...reviews,
                reviewImages: uploadedImageUrls
            };

            postData("/api/user/addReview", reviewData).then((res) => {
                if (res?.error === false) {
                    context.alertBox("success", res?.message);
                    setReviews(() => ({
                        ...reviews,
                        review: '',
                        rating: 1
                    }))
                    setSelectedImages([]);
                    setImagePreviews([]);

                    setLoading(false);
                    getReviews();
                    
                    // Refresh product data to update rating
                    if (props?.refreshProductData) {
                        props.refreshProductData();
                    }

                } else {
                    context.alertBox("error", res?.message);
                    setLoading(false);
                }
            }).catch((error) => {
                context.alertBox("error", "Failed to add review");
                setLoading(false);
            })
        }
        else {
            context.alertBox("error", "Please add review");
        }


    }



    const getReviews = () => {
        fetchDataFromApi(`/api/user/getReviews?productId=${props?.productId}`).then((res) => {
            if (res?.error === false) {
                setReviewsData(res.reviews)
                props.setReviewsCount(res.reviews.length)
            }
        })
    }

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        setDeletingReviewId(reviewId);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.delete(apiUrl + `/api/user/deleteReview/${reviewId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }
            });
            
            const responseData = response?.data;
            
            if (responseData?.error === false) {
                context.alertBox("success", responseData?.message || "Review deleted successfully");
                getReviews();
                
                // Refresh product data to update rating
                if (props?.refreshProductData) {
                    props.refreshProductData();
                }
            } else {
                context.alertBox("error", responseData?.message || "Failed to delete review");
            }
        } catch (error) {
            context.alertBox("error", error?.response?.data?.message || "Failed to delete review");
        } finally {
            setDeletingReviewId(null);
        }
    }

    return (
        <div className="w-full productReviewsContainer">
            <h2 className="text-[16px] lg:text-[18px]">Customer questions & answers</h2>

            {
                reviewsData?.length !== 0 &&
                <div className="reviewScroll w-full max-h-[300px] overflow-y-scroll overflow-x-hidden mt-5 pr-5">
                    {
                        reviewsData?.map((review, index) => {
                            const isOwnReview = context?.userData?._id === review?.userId;
                            return (
                                <div key={review?._id || index} className="review pt-5 pb-5 border-b border-[rgba(0,0,0,0.1)] w-full flex items-center justify-between">
                                    <div className="info w-[80%] flex items-center gap-3">
                                        <div className="img w-[60px] h-[60px] overflow-hidden rounded-full">

                                            {
                                                review?.image !== "" && review?.image !== null ?
                                                    <img
                                                        src={review?.image}
                                                        className="w-full"
                                                    />

                                                    :
                                                    <img
                                                        src={"/user.jpg"}
                                                        className="w-full"
                                                    />
                                            }

                                        </div>

                                        <div className="w-[80%]">
                                            <h4 className="text-[16px]">{review?.userName}</h4>
                                            <h5 className="text-[13px] mb-0">{review?.createdAt?.split("T")[0]}</h5>
                                            <p className="mt-0 mb-0 text-[13px]">
                                                {review?.review}
                                            </p>
                                            {review?.reviewImages && review?.reviewImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {review.reviewImages.map((imgUrl, imgIndex) => (
                                                        <img 
                                                            key={imgIndex}
                                                            src={imgUrl} 
                                                            alt={`Review ${imgIndex + 1}`}
                                                            className="w-[80px] h-[80px] object-cover rounded-md cursor-pointer"
                                                            onClick={() => window.open(imgUrl, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Rating name="size-small" size="small" value={typeof review?.rating === 'string' ? parseFloat(review?.rating) || 0 : (review?.rating || 0)} readOnly />
                                        {isOwnReview && (
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDeleteReview(review?._id)}
                                                disabled={deletingReviewId === review?._id}
                                                title="Delete your review"
                                            >
                                                {deletingReviewId === review?._id ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <MdDelete size={18} />
                                                )}
                                            </IconButton>
                                        )}
                                    </div>
                                </div>)
                        })
                    }
                </div>
            }


            <br />

            <div className="reviewForm bg-[#fafafa] p-4 rounded-md">
                <h2 className="text-[18px]">Add a review</h2>

                <form className="w-full mt-5" onSubmit={addReview}>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Write a review..."
                        className="w-full"
                        onChange={onChangeInput}
                        name="review"
                        multiline
                        rows={5}
                        value={reviews.review}
                    />

                    <br />
                    <br />
                    <Rating name="size-small" value={reviews.rating} onChange={(event, newValue) => {
                        setReviews(() => ({
                            ...reviews,
                            rating: newValue
                        }))
                    }} />

                    <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-[14px] text-gray-600 hover:text-primary">
                            <FaImage />
                            <span>Add photos </span>
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                        
                        {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`}
                                            className="w-[80px] h-[80px] object-cover rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] hover:bg-red-600"
                                        >
                                            <MdClose size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mt-5">


                        <Button type="submit" className="btn-org flex gap-2" disabled={loading || uploadingImages}>
                       
                            {
                                (loading || uploadingImages) === true && <CircularProgress size={15}/> 
                            }
                            {uploadingImages ? 'Uploading Images...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

