import { getChannel } from "./rabbitmq";

export const publishPaymenSuccess = async(payload:{
    orderId:string,
    paymentId:string,
    provider:"razorpay"|"stripe"
})=>{
    const channel = getChannel();
    channel.sendToQueue(process.env.PAYMENT_QUEUE!,Buffer.from(JSON.stringify({
        type:"PAYMENT_SUCCESS",
        payload})),{
        persistent:true
    })
}