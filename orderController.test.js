const {
    createOrder,
    getOrdersispayedfalse,
    getUserUnpaidOrders,
    updateOrder,
    updateProductQuantity,
    getOrdersispayedtrue,
    getOverallTotalPrice
} = require("./controllers/orderController");
const Order = require("./models/order");

jest.mock("./models/order");

describe("Order Controller", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                user_id: "user123",
                products: [
                    { inventory_id: "item1", quantity: 2, unit_price: 10 },
                    { inventory_id: "item2", quantity: 3, unit_price: 15 }
                ],
                ispayed: true,
                ispacked: false,
                isdelivered: false,
                place_address: "123 Main St"
            },
            params: {
                userId: "user123",
                orderId: "order123",
                productId: "item1"
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("createOrder", () => {
        it("should create an order successfully", async () => {
            const mockOrder = {
                save: jest.fn().mockResolvedValue({
                    _id: "order123",
                    user_id: "user123",
                    products: [
                        { inventory_id: "item1", quantity: 2, unit_price: 10, total_price: 20 },
                        { inventory_id: "item2", quantity: 3, unit_price: 15, total_price: 45 }
                    ],
                    overall_total_price: 65,
                    ispayed: true,
                    ispacked: false,
                    isdelivered: false,
                    place_address: "123 Main St"
                })
            };

            Order.mockImplementation(() => mockOrder);

            await createOrder(req, res);

            expect(Order).toHaveBeenCalledWith({
                user_id: "user123",
                products: [
                    { inventory_id: "item1", quantity: 2, unit_price: 10, total_price: 20 },
                    { inventory_id: "item2", quantity: 3, unit_price: 15, total_price: 45 }
                ],
                overall_total_price: 65,
                ispayed: true,
                ispacked: false,
                isdelivered: false,
                place_address: "123 Main St"
            });

            expect(mockOrder.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Order created successfully",
                data: expect.any(Object)
            });
        });

        // Other createOrder test cases remain the same as provided above
    });

    describe("getOrdersispayedfalse", () => {
        it("should return all orders with ispayed as false", async () => {
            const mockOrders = [
                { _id: "order1", ispayed: false },
                { _id: "order2", ispayed: false }
            ];

            Order.find.mockResolvedValue(mockOrders);

            await getOrdersispayedfalse(req, res);

            expect(Order.find).toHaveBeenCalledWith({ ispayed: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Orders fetched successfully",
                data: mockOrders
            });
        });

        it("should handle server errors", async () => {
            Order.find.mockRejectedValue(new Error("Database error"));

            await getOrdersispayedfalse(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error orders fetched",
                error: "Database error"
            });
        });
    });

    describe("getUserUnpaidOrders", () => {
        it("should return all unpaid orders for a specific user", async () => {
            const mockOrders = [
                { _id: "order1", user_id: "user123", ispayed: false },
                { _id: "order2", user_id: "user123", ispayed: false }
            ];

            Order.find.mockResolvedValue(mockOrders);

            await getUserUnpaidOrders(req, res);

            expect(Order.find).toHaveBeenCalledWith({
                user_id: "user123",
                ispayed: false
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Unpaid orders fetched successfully",
                data: mockOrders
            });
        });

        it("should handle server errors", async () => {
            Order.find.mockRejectedValue(new Error("Database error"));

            await getUserUnpaidOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error fetching unpaid orders",
                error: "Database error"
            });
        });
    });

    describe("updateOrder", () => {
        it("should update an order successfully", async () => {
            const mockUpdatedOrder = {
                _id: "order123",
                user_id: "user123",
                ispayed: true
            };

            Order.findByIdAndUpdate.mockResolvedValue(mockUpdatedOrder);

            req.body = { ispayed: true };

            await updateOrder(req, res);

            expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
                "order123",
                { ispayed: true },
                { new: true, runValidators: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Order updated successfully",
                data: mockUpdatedOrder
            });
        });

        it("should return 404 if order is not found", async () => {
            Order.findByIdAndUpdate.mockResolvedValue(null);

            await updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Order not found"
            });
        });

        it("should handle server errors", async () => {
            Order.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

            await updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error updating order",
                error: "Database error"
            });
        });
    });

    describe("updateProductQuantity", () => {
        it("should update a product quantity in an order", async () => {
            const mockOrder = {
                _id: "order123",
                products: [
                    { inventory_id: "item1", quantity: 2, unit_price: 10, total_price: 20 }
                ],
                save: jest.fn().mockResolvedValue({
                    _id: "order123",
                    products: [
                        { inventory_id: "item1", quantity: 5, unit_price: 10, total_price: 50 }
                    ]
                })
            };

            Order.findById.mockResolvedValue(mockOrder);
            req.body.quantity = 5;

            await updateProductQuantity(req, res);

            expect(mockOrder.products[0].quantity).toBe(5);
            expect(mockOrder.products[0].total_price).toBe(50);
            expect(mockOrder.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        
    });

    describe("getOverallTotalPrice", () => {
        it("should calculate the total price of all ispayed orders", async () => {
            const mockOrders = [
                { overall_total_price: 100 },
                { overall_total_price: 200 }
            ];

            Order.find.mockResolvedValue(mockOrders);

            await getOverallTotalPrice(req, res);

            expect(Order.find).toHaveBeenCalledWith({ ispayed: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Total overall_total_price fetched successfully",
                data: 300
            });
        });

        // Handle error cases
    });
});
