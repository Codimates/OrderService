const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        inventory_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        unit_price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        },
        total_price: {
            type: Number,
            required: true,
            validate: {
                validator: function() {
                    // Allow small floating point discrepancies
                    return Math.abs((this.quantity * this.unit_price) - this.total_price) < 0.01;
                },
                message: 'Total price calculation is incorrect'
            }
        }
    }],
    overall_total_price: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    ispayed: {
        type: Boolean,
        default: false
    },
    ispacked: {
        type: Boolean,
        default: false
    },
    isdelivered: {
        type: Boolean,
        default: false
    },
    place_address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;