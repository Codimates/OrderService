const stripe = require('stripe');
const  createPaymentIntent  = require('./stripeController');

jest.mock('stripe', () => {
    const mockStripe = jest.fn(() => ({
        paymentIntents: {
            create: jest.fn(),
        },
    }));
    return mockStripe;
});

describe('Stripe createPaymentIntent', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    const stripeInstance = stripe();

    beforeEach(() => {
        mockRequest = {
            body: {
                amount: 5000, // Amount in cents (e.g., $50.00)
                cartItems: [
                    { id: 1, name: 'Product A', price: 2500 },
                    { id: 2, name: 'Product B', price: 2500 },
                ],
                userId: 'user_12345',
            },
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockNext = jest.fn();
    });

    it('should create a payment intent and return client_secret', async () => {
        const mockClientSecret = 'test_client_secret_12345';

        // Mock Stripe's `paymentIntents.create` method
        stripeInstance.paymentIntents.create.mockResolvedValue({
            client_secret: mockClientSecret,
        });

        await createPaymentIntent(mockRequest, mockResponse, mockNext);

        expect(stripeInstance.paymentIntents.create).toHaveBeenCalledWith({
            amount: 5000,
            currency: 'usd',
            metadata: {
                user_id: 'user_12345',
                cart_items: JSON.stringify(mockRequest.body.cartItems),
            },
            payment_method_types: ['card'],
        });

        expect(mockResponse.json).toHaveBeenCalledWith({
            client_secret: mockClientSecret,
        });
    });

    it('should handle errors and return an error message', async () => {
        const mockError = new Error('Failed to create payment intent');

        // Mock Stripe's `paymentIntents.create` method to throw an error
        stripeInstance.paymentIntents.create.mockRejectedValue(mockError);

        await createPaymentIntent(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Payment intent creation failed',
            error: mockError.message,
        });
    });
});
