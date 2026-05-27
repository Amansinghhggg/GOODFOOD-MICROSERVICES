import React,{useState} from "react";
import { useAppContext } from "../context/context";
import axios from "axios";
import { authService } from "../main";
import toast from "react-hot-toast";
import {
    FaUser,
    FaMotorcycle,
    FaStore,
    FaCheck,
} from "react-icons/fa";

const SelectRoles = () => {
    const [role, setRole] = useState("");
   const {setUser} =useAppContext();
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.put(`${authService}/api/auth/add/role`, { role }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setUser(data.user);
        localStorage.setItem("token", data.token);
        toast.success("Role set successfully");

    } catch (error) {
        toast.error("Failed to set role. Please try again.");
        console.log(error);
    }       
    }
    const roles = [
        {
            id: "customer",
            title: "Customer",
            icon: <FaUser size={40} />,
            description:
                "Order delicious food from nearby restaurants and get it delivered fast to your doorstep.",
        },
        {
            id: "rider",
            title: "Rider",
            icon: <FaMotorcycle size={40} />,
            description:
                "Deliver food, earn money, manage flexible working hours, and become a delivery partner.",
        },
        {
            id: "owner",
            title: "Restaurant Owner",
            icon: <FaStore size={40} />,
            description:
                "Reach thousands of hungry customers, grow your restaurant business, and manage orders easily.",
        },
    ];
    return (
    <div className="min-h-screen bg-linear-to-b from-white to-pink-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl">
                
                <div className="mb-16 text-center">

    <div className="mb-4 inline-flex items-center rounded-full bg-[#E23774]/10 px-4 py-2 text-sm font-medium text-[#E23774]">
        🍔 Fast • Fresh • Delivered
    </div>

    <h1 className="text-6xl font-black tracking-tight text-gray-900">
        GOOD
        <span className="text-[#E23774]">FOOD</span>
    </h1>

    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-500">
        Your all-in-one food delivery platform for ordering meals,
        delivering happiness, and growing restaurant businesses.
    </p>

    <div className="mt-10">
        <h2 className="text-3xl font-bold text-gray-800">
            Select Your Role
        </h2>

        <p className="mt-2 text-gray-500">
            Choose how you want to continue
        </p>
    </div>

</div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-3">
                        {roles.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setRole(item.id)}
                                className={`relative cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                                
                                ${
                                    role === item.id
                                        ? "border-[#E23774] ring-2 ring-[#E23774]"
                                        : "border-gray-200"
                                }
                                `}
                            >
                                {role === item.id && (
                                    <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#E23774] text-white">
                                        <FaCheck size={12} />
                                    </div>
                                )}

                                <div className="mb-5 text-[#E23774]">
                                    {item.icon}
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-800">
                                    {item.title}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!role}
                        className="mt-10 w-full rounded-xl bg-[#E23774] px-6 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-[#d12c67] disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );





};  

export default SelectRoles;
