import CartProductModel from "../models/cartProduct.modal.js";

export const addToCartItemController = async (request, response) => {
    try {
        const userId = request.userId //middleware
        const { productTitle, image, rating, price, oldPrice, quantity, subTotal, productId, countInStock, discount,size, weight, ram, brand } = request.body

        if (!productId) {
            return response.status(402).json({
                message: "Provide productId",
                error: true,
                success: false
            })
        }


        // Normalize empty strings to null for consistent matching
        const normalizedSize = (size && size.trim() !== '') ? size.trim() : null;
        const normalizedWeight = (weight && weight.trim() !== '') ? weight.trim() : null;
        const normalizedRam = (ram && ram.trim() !== '') ? ram.trim() : null;

        // Build query to match exact variant combination
        // Check for items with same productId AND exact same variant combination (size, weight, ram)
        const query = {
            userId: userId,
            productId: productId
        };

        // Add variant fields - match exact values
        // For empty/null values, use $in to match null, empty string, or use $or for $exists: false
        if (normalizedSize !== null) {
            query.size = normalizedSize;
        } else {
            // Match null, empty string, or undefined - products without size
            query.$or = [
                { size: null },
                { size: '' },
                { size: { $exists: false } }
            ];
        }

        // Handle weight - combine with size condition using $and
        if (normalizedWeight !== null) {
            query.weight = normalizedWeight;
        } else {
            const weightCondition = {
                $or: [
                    { weight: null },
                    { weight: '' },
                    { weight: { $exists: false } }
                ]
            };
            
            if (query.$or) {
                // Combine size and weight conditions using $and
                query.$and = [
                    { $or: query.$or },
                    weightCondition
                ];
                delete query.$or;
            } else {
                query.$or = weightCondition.$or;
            }
        }

        // Handle ram - combine with previous conditions
        if (normalizedRam !== null) {
            query.ram = normalizedRam;
        } else {
            const ramCondition = {
                $or: [
                    { ram: null },
                    { ram: '' },
                    { ram: { $exists: false } }
                ]
            };
            
            if (query.$and) {
                query.$and.push(ramCondition);
            } else if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    ramCondition
                ];
                delete query.$or;
            } else {
                query.$or = ramCondition.$or;
            }
        }

        const checkItemCart = await CartProductModel.findOne(query)

        if (checkItemCart) {
            return response.status(400).json({
                message: "Item already in cart"
            })
        }


        const cartItem = new CartProductModel({
            productTitle:productTitle,
            image:image,
            rating:rating,
            price:price,
            oldPrice:oldPrice,
            quantity:quantity,
            subTotal:subTotal,
            productId:productId,
            countInStock:countInStock,
            userId:userId,
            brand:brand,
            discount:discount,
            size:normalizedSize, // Use normalized values for consistency
            weight:normalizedWeight,
            ram:normalizedRam
        })

        const save = await cartItem.save();


        return response.status(200).json({
            data: save,
            message: "Item add successfully",
            error: false,
            success: true
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const getCartItemController = async (request, response) => {
    try {
        const userId = request.userId;

        const cartItems = await CartProductModel.find({
            userId: userId
        });

        return response.json({
            data: cartItems,
            error: false,
            success: true
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const updateCartItemQtyController = async (request, response) => {
    try {

        const userId = request.userId
        const { _id, qty , subTotal, size, weight, ram} = request.body



        if (!_id || !qty) {
            return response.status(400).json({
                message: "provide _id, qty"
            })
        }

        const updateCartitem = await CartProductModel.updateOne(
            {
                _id: _id,
                userId: userId
            },
            {
                quantity: qty,
                subTotal:subTotal,
                size:size,
                ram:ram,
                weight:weight
            },
            { new: true }
        )


        return response.json({
            message: "Update cart item",
            success: true,
            error: false,
            data: updateCartitem
        })



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const deleteCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId // middleware
        const { id } = request.params


        if(!id){
            return response.status(400).json({
                message : "Provide _id",
                error : true,
                success : false
            })
          }


          const deleteCartItem  = await CartProductModel.deleteOne({_id : id, userId : userId })

          if(!deleteCartItem){
            return response.status(404).json({
                message:"The product in the cart is not found",
                error:true,
                success:false
            })
          }
         

          return response.status(200).json({
            message : "Item remove",
            error : false,
            success : true,
            data : deleteCartItem
          })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export const emptyCartController = async (request, response) => {
    try {
        const userId = request.params.id // middlewar

        await CartProductModel.deleteMany({userId:userId })

          return response.status(200).json({
            error : false,
            success : true,
          })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}