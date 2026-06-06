import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import { Rider } from "../model/Rider.js";

export const startOrderReadyConsumer =async () => {
    const channel = getChannel();
    console.log('Starting Order Ready Consumer for Rider Service 🚴‍♂️🚴‍♀️');
    channel.consume(process.env.ORDER_READY_QUEUE!, async (msg) => {
        if (!msg) return;
        try {
            console.log('Recieved Message ', msg.content.toString());
            const event = JSON.parse(msg.content.toString());
            console.log('Parsed Event ', event);
            if (event.type !== "ORDER_READY_FOR_RIDER") {
                console.log('skipping message of type ', event.type);
                channel.ack(msg);
                return;                
            }
            const { orderId, restaurantId, location } = event.data;
            console.log(`searching for riders near restaurant ${restaurantId} for order ${orderId}`);
            const Riders = await Rider.find({
                isAvailable: true,
                isVerified: true,
                location: {
                    $near: {
                        $geometry: location,
                        $maxDistance: 5000,
                    },
                },
            });
            console.log(`Found ${Riders.length} riders near restaurant ${restaurantId} for order ${orderId}`);
            if(Riders.length === 0){
                console.log(`No riders available near restaurant ${restaurantId} for order ${orderId}`);
                channel.ack(msg);
                return;
            }
            for(const rider of Riders){
                try {
                    await axios.post(`${process.env.REALTIME_SERVICE_URL}/api/v1/internal/emit`,{
                        event:"order_ready_for_rider",
                        room:`rider:${rider.userId}`,
                        payload:{
                            orderId,
                            restaurantId,
                        }
                    },{
                            headers:{
                                "x-internal-key": process.env.INTERNAL_SERVICE_KEY}
                        }
                );
                console.log(`Notified rider ${rider._id} about order successfully`);

                }catch (error) {
                    console.error(`Error notifying rider ${rider._id} about order:`, error);
                }
            }
            channel.ack(msg);
            console.log(`MESSAGE ACKNOWLEDGED`);
        }catch (error) {
            console.error('Error processing order ready message:', error);
        }
    });
    }

        