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

            channel.ack(msg);


        } catch (error) {
            console.error('Error occurred while processing payment:', error);
            channel.nack(msg, false, false);
        }});
}