const stripe = require('stripe')('sk_test_51QSgJEAmilHOBn6cOqadCKpjBBCRgBEYBTfZLcbnYqEtmDIK9XkU07je7CCEEy2PRCuv13OjCHfK3WMUdwYVdYGS00sr46ABBA',{apiVersion: '2023-10-16', // Use the latest API version
    protocol: 'https'});
const PayDetails = require('../models/payDetails');
// In your stripe controller
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, cartItems, userId } = req.body;
    
        // Validate amount on the server
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount, // amount in cents
          currency: 'usd',
          metadata: {
            user_id: userId,
            cart_items: JSON.stringify(cartItems)
          },
          payment_method_types: ['card']
        });
    
        res.json({ 
          client_secret: paymentIntent.client_secret 
        });
      } catch (err) {
        res.status(500).json({ 
          message: 'Payment intent creation failed',
          error: err.message 
        });
      }
}

module.exports = {
    createPaymentIntent
}