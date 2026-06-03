import{ useEffect, useState } from "react";
import { useAppContext } from "../context/context";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import {  Link, useNavigate } from "react-router-dom";
import type { IRestaurant } from "../types";
import toast from "react-hot-toast";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}
const Checkout = () => {
  const {cart,subtotal,quantity,location} = useAppContext();
  const [addresss,setAddresss] = useState([] as Address[]);
  const [selectedAddress,setSelectedAddress] = useState<string|null>(null);
  const [loadingAddress,setLoadingAddress] = useState(true);
  const [loadingRazorpay,setLoadingRazorpay] = useState(false);
  const [creatingOrder,setCreatingOrder] = useState(false);
  useEffect(()=>{
    const fetchAddress =async ()=>{
       if(!cart || quantity === 0){
    setLoadingAddress(false)
    return      
    }
    try {
      const {data} = await axios.get(`${restaurantService}/api/address/all`,
        {headers:{"Authorization":`Bearer ${localStorage.getItem("token")}`}})
        setAddresss(data.addresses || []);
    } catch (error) {
      console.log(error);
    }finally{
      setLoadingAddress(false);
    }
    }
   fetchAddress();
   console.log(cart,subtotal,quantity,addresss)
  },[cart])
  
  const navigate = useNavigate();

  if(!cart || quantity === 0){
    return (
      <><div>Cart is empty</div></>
    )
  }
  const restaurant = Array.isArray(cart) ? (cart[0]?.restaurantId as IRestaurant) : cart.restaurantId as IRestaurant;
  const deliveryFee = subtotal<250? 49:0;
  const platfromFee = 7;
  const grandTotal = subtotal + deliveryFee + platfromFee;
  const restaurantLocation = restaurant?.autoLocation?.coordinates;
 
  const calculateDistanceKm = (
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
  ) => {
    const earthRadiusKm = 6371;
    const latitudeDelta = ((toLatitude - fromLatitude) * Math.PI) / 180;
    const longitudeDelta = ((toLongitude - fromLongitude) * Math.PI) / 180;
    const fromLatRad = (fromLatitude * Math.PI) / 180;
    const toLatRad = (toLatitude * Math.PI) / 180;

    const a =
      Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
      Math.cos(fromLatRad) * Math.cos(toLatRad) *
      Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const createOrder = async()=>{
    if(!selectedAddress){
      alert("Please select an address");
      return;
    }
    if(!location || !restaurantLocation){
      toast.error("Unable to calculate delivery distance right now");
      return;
    }
    setCreatingOrder(true);
    try {
      const {data} = await axios.post(`${restaurantService}/api/order/new`,{
        paymentMethod:"razorpay",
        addressId:selectedAddress,
        distance: calculateDistanceKm(
          location.latitude,
          location.longitude,
          restaurantLocation[1],
          restaurantLocation[0],
        ),
      },{
        headers:{"Authorization":`Bearer ${localStorage.getItem("token")}`}
      });
      return data;
  }catch(error){
      console.log(error);
      toast.error("Failed to create order");
  }finally{
    setCreatingOrder(false);
  }
};

const payWithRazorpay = async()=>{
  try {
    setLoadingRazorpay(true);
    const order = await createOrder();
    if(!order){
      return
    }
    const {orderId,amount} = order
    const {data} = await axios.post(`${utilsService}/api/payment/create`,{
      orderId,
    })
    const {razorpayOrderId,key} = data;
    const options ={
      key,
      amount:amount*100,
      Currency:"INR",
      name:"GOODFOOD",
      description:"Food order Payment",
      order_id:razorpayOrderId,
      handler:async(response:any)=>{
        try{
          await axios.post(`${utilsService}/api/payment/verify`,{
           razorpay_order_id:response.razorpay_order_id, 
           razorpay_payment_id:response.razorpay_payment_id,
           razorpay_signature:response.razorpay_signature,
           orderId:orderId
          })
          toast.success("Payment successful");
          navigate(`/paymentsuccess/${response.razorpay_payment_id}`);
        } catch (error) {
          console.log(error);
          toast.error("Payment verification failed");
        }
      },
      theme:{
        "color":"#E23744"
      }
    }
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  } catch (error) {
    toast.error("Payment failed Please try again");
    console.log(error);
  } finally {
    setLoadingRazorpay(false);
  }
  }
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Delivery Address</h3>
        {loadingAddress ? (
          <p>Loading addresses...</p>
        ) : addresss.length === 0 ? (
          <p>No addresses found. Please add an address <Link to="/AddAddress">here</Link>.</p>
        ) : (
          <div className="space-y-2">
            {addresss.map((addr) => (
              <div key={addr._id} className={`p-3 border rounded cursor-pointer ${selectedAddress === addr._id ? 'border-blue-500' : 'border-gray-300'}`} onClick={() => setSelectedAddress(addr._id)}>
                <p>{addr.formattedAddress}</p>
                <p>Mobile: {addr.mobile}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
        <p>Restaurant: {restaurant.name}</p>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Delivery Fee: ₹{deliveryFee}</p>
        <p>Platform Fee: ₹{platfromFee}</p>
        <p className="font-bold">Grand Total: ₹{grandTotal}</p>
      </div>
      <button onClick={payWithRazorpay} disabled={loadingRazorpay || creatingOrder} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400">
        {loadingRazorpay || creatingOrder ? "Processing..." : "Pay with Razorpay"}
      </button>
    </div>
  );
}


export default Checkout;
