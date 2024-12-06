const Order = require('../models/order');

const createOrder = async (req, res) => {
   try {
       const { user_id, products, ispayed, ispacked, isdelivered, place_address } = req.body;
       
       // More robust validation
       if (!user_id) {
           return res.status(400).json({ message: "User ID is required" });
       }
       
       if (!products || !Array.isArray(products) || products.length === 0) {
           return res.status(400).json({ message: "Products array cannot be empty" });
       }
       
       // Validate each product
       const validatedProducts = products.map(product => {
           // Ensure required fields are present and valid
           if (!product.inventory_id || !product.quantity || !product.unit_price) {
               throw new Error("Invalid product details");
           }
           
           return {
               inventory_id: product.inventory_id,
               quantity: product.quantity,
               unit_price: product.unit_price,
               total_price: product.quantity * product.unit_price
           };
       });
       
       const overallTotalPrice = validatedProducts.reduce((sum, product) => sum + product.total_price, 0);
       
       const order = new Order({
           user_id,
           products: validatedProducts,
           overall_total_price: overallTotalPrice,
           ispayed: ispayed || false,
           ispacked: ispacked || false,
           isdelivered: isdelivered || false,
           place_address: place_address
       });
       
       const savedOrder = await order.save();
       res.status(201).json({ message: "Order created successfully", data: savedOrder });
   } catch (error) {
       console.error('Order creation error:', error);
       res.status(400).json({ message: "Error creating order", error: error.message });
   }
};

// Get orders with ispayed as false
const getOrdersispayedfalse = async (req, res) => {
    try {
        const orders = await Order.find({ispayed:false});
        res.status(200).json({message:"Orders fetched successfully", data: orders});
    } catch (error) {
        res.status(500).json({message:"Error orders fetched", error: error.message});
    }
};

// Get unpaid orders for a specific user
const getUserUnpaidOrders = async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await Order.find({
         user_id: userId,
         ispayed: false
       });
      res.status(200).json({ message: "Unpaid orders fetched successfully", data: orders });
    } catch (error) {
      res.status(500).json({ message: "Error fetching unpaid orders", error: error.message });
    }
};

// Get paid orders for a specific user
const getUserpaidOrders = async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await Order.find({
         user_id: userId,
         ispayed: true
       });
      res.status(200).json({ message: "Unpaid orders fetched successfully", data: orders });
    } catch (error) {
      res.status(500).json({ message: "Error fetching unpaid orders", error: error.message });
    }
};

// Update order method
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;
        
        // If products are being updated, recalculate total price
        if (updateData.products) {
            updateData.overall_total_price = updateData.products.reduce(
                (sum, product) => sum + (product.quantity * product.unit_price),
                0
            );
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            {
                new: true,  // Return the modified document
                runValidators: true  // Run model validations on update
            }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.status(200).json({
            message: "Order updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        console.error('Order update error:', error);
        res.status(400).json({ message: "Error updating order", error: error.message });
    }
};

// New method to update product quantity in an order
const updateProductQuantity = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const { quantity } = req.body;
        
        // Validate input
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }
        
        // Find the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Find the specific product in the order
        const productIndex = order.products.findIndex(
            p => p.inventory_id.toString() === productId
        );
        
        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found in order" });
        }
        
        // Update the product quantity and total price
        const product = order.products[productIndex];
        product.quantity = quantity;
        product.total_price = quantity * product.unit_price;
        
        // Recalculate overall total price
        order.overall_total_price = order.products.reduce(
            (sum, p) => sum + p.total_price, 
            0
        );
        
        // Save the updated order
        const updatedOrder = await order.save();
        
        res.status(200).json({
            message: "Product quantity updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        console.error('Product quantity update error:', error);
        res.status(400).json({ message: "Error updating product quantity", error: error.message });
    }
};

//get orders is payed true
const getOrdersispayedtrue = async (req, res) => {
    try {
        const orders = await Order.find({ispayed:true});
        res.status(200).json({message:"Orders fetched successfully", data: orders});
    } catch (error) {
        res.status(500).json({message:"Error orders fetched", error: error.message});
    }
};

//get total overall_total_price
const getOverallTotalPrice = async (req, res) => {
    try {
        const orders = await Order.find({ispayed:true});
        const total = orders.reduce((sum, order) => sum + order.overall_total_price, 0);
        res.status(200).json({message:"Total overall_total_price fetched successfully", data: total});
    } catch (error) {
        res.status(500).json({message:"Error total overall_total_price fetched", error: error.message});
    }
};

module.exports = {
    createOrder,
    getOrdersispayedfalse,
    getUserUnpaidOrders,
    getUserpaidOrders,
    updateOrder,
    updateProductQuantity, 
    getOrdersispayedtrue,
    getOverallTotalPrice
};