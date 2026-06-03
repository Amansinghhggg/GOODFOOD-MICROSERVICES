import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import CreateRestaurant from "../components/restaurant/createRestaurant";
import YourRestaurant from "../components/restaurant/YourRestaurant";
import RestaurantOrder from "../components/restaurant/RestaurantOrder";

const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [Loading, setLoading] = useState(false);
    async function fetchRestaurant() {
        setLoading(true);
        try {
            
            const response = await axios.get(`${restaurantService}/api/restaurant/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            setRestaurant(response.data.restaurant||null);
            
        } catch (error) {
            console.error("Error fetching restaurant:", error);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchRestaurant();
    }, [])
    
    if(Loading){
        return <div className="h-16 flex items-center justify-center bg-gray-200">Loading...</div>;
    }
    if(!restaurant){
        return <CreateRestaurant/>
    }
    if (restaurant) {
        const handleToggle = async () => {
            try {
                await axios.put(`${restaurantService}/api/restaurant/is-open`, { }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                await fetchRestaurant();
            } catch (err) {
                console.error("Failed to toggle open state", err);
            }
        };

        return (<>

         <RestaurantOrder restaurantId={restaurant._id} />
        <YourRestaurant restaurant={restaurant} onToggle={handleToggle} />

        </>
       
    )
    }
};

export default Restaurant;
