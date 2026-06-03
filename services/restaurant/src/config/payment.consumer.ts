import axios from 'axios';
import { Order } from '../Models/order.js';
import {getChannel} from './rabbitmq.js';

export const startPaymentConsumer = async() => {
    const channel = getChannel();
    channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
        if(!msg) return;
        try {
            const event = JSON.parse(msg.content.toString());
            if(event.type !== 'PAYMENT_SUCCESS') {
                channel.ack(msg);
                return;
            }

            const paymentEvent = event.payload ?? event.data;
            const { orderId } = paymentEvent || {};
            if(!orderId) {
                console.error('PAYMENT_SUCCESS event missing orderId:', event);
                channel.nack(msg, false, false);
                return;
            }

            const order = await Order.findOneAndUpdate({
                _id:orderId,
                paymentStatus:{$ne:'paid'}
            }, {
                $set: {
                    paymentStatus: 'paid',
                    status: 'placed'
                },
                $unset: { expiresAt: "" }
            }, { new: true });
            if(!order) {
                channel.ack(msg);
                return;
            }
            console.log(`Order ${orderId} marked as paid.`);

            const realtimeUrl = process.env.REALTIME_SERVICE_URL;
            if (!realtimeUrl) {
                console.error('REALTIME_SERVICE_URL not defined; skipping realtime emit for order', order._id);
            } else {
                try {
                    await axios.post(
                        `${realtimeUrl}/api/v1/internal/emit`,
                        {
                            event: "order_new",
                            room: `restaurant:${order.restaurantId}`,
                            payload: {
                                orderId: order._id,
                            },
                        },
                        {
                            headers: {
                                "x-internal-key": process.env.INTERNAL_SERVICE_KEY ?? "",
                            },
                        }
                    );
                } catch (err) {
                    console.error('Failed to notify realtime service about new order', err);
                }
            }

            channel.ack(msg);


        } catch (error) {
            console.error('Error occurred while processing payment:', error);
            channel.nack(msg, false, false);
        }});
}