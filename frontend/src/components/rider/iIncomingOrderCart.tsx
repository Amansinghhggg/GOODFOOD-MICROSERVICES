import  { useEffect, useState } from "react";
import { riderService } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
interface Props {
    orderId: string;
    onAccepted: () => void;
}
const IncomingOrderCart = ({ orderId, onAccepted }: Props) => {
const [accepting, setAccepting] = useState(false);
const [secondsLeft, setSecondsLeft] = useState(10);
useEffect(() => {
    const interval = setInterval(() => {
        setSecondsLeft((prev) =>{
            if(prev <= 1){
                clearInterval(interval);
                onAccepted();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(interval);
}, [onAccepted]);

const acceptOrder = async () => {
    if(accepting) return;
    setAccepting(true);
    try {
        await axios.post(`${riderService}/api/rider/accept/${orderId}`,{}, {
            headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        toast.success("Order accepted successfully!");
        onAccepted();
    } catch (error: any) {
        console.error("Error accepting order:", error.response.data.message);
        toast.error("Failed to accept order.");
    }finally {
        setAccepting(false);
    }
}
    return (
        <div className="p-4 border rounded shadow bg-white">
            <h3 className="text-lg font-semibold mb-2">New Order Available!</h3>
            <p className="mb-4">Order ID: {orderId}</p>
            <p className="mb-4 text-sm text-gray-500">Time left to accept: {secondsLeft} seconds</p>
            <button
                onClick={acceptOrder}
                disabled={accepting}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
                {accepting ? "Accepting..." : "Accept Order"}
            </button>
        </div>
    );
}

export default IncomingOrderCart;
