import type { IOrder } from "../../types";
import { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import { realtimeService } from "../../main";

declare module "leaflet" {
    namespace Routing {
        function control(options: any): any;
        function osrmv1(options: any): any;
    }
}

const riderIcon = new L.DivIcon({
    html: "🛵",
    iconSize: [30, 30],
    className: "rider-icon",
});

const deliveryIcon = new L.DivIcon({
    html: "📦",
    iconSize: [30, 30],
    className: "delivery-icon",
});

interface IOrderMapProps {
    order: IOrder;
}

const Routing = ({ from, to }: { from: [number, number]; to: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        const control = L.Routing.control({
            waypoints: [L.latLng(from), L.latLng(to)],
            lineOptions: { styles: [{ color: "#E23744", weight: 3 }] },
            addWaypoints: false,
            draggableWaypoints: false,
            show: false,
            createMarker: () => null,
            router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
        }).addTo(map);
        return () => { map.removeControl(control); };
    }, [from, to, map]);
    return null;
};

const OrderMap = ({ order }: IOrderMapProps) => {
    const [riderPosition, setRiderPosition] = useState<[number, number] | null>(null);

    if (order.deliveryAddress.latitude == null || order.deliveryAddress.longitude == null) {
        return (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-gray-500">
                Location data not available
            </div>
        );
    }

    const deliveryLocation: [number, number] = [
        Number(order.deliveryAddress.latitude),
        Number(order.deliveryAddress.longitude),
    ];

    useEffect(() => {
        const fetchRiderLocation = async () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setRiderPosition([latitude, longitude]);
                axios.post(`${realtimeService}/api/v1/internal/emit`, {
                    event: "riderLocationUpdate",
                    room: `order_${order._id}`,
                    payload: { latitude, longitude },
                }, {
                    headers: { "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY },
                });
            }, (error: any) => {
                console.error("Error sending location update:", error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 3000,
            });
        };
        fetchRiderLocation();
        const interval = setInterval(fetchRiderLocation, 10000);
        return () => clearInterval(interval);
    }, [order._id]);

    if (!riderPosition) {
        return (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-gray-500">
                Fetching your location…
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-yellow-500/20 shadow-lg">
            <div className="flex items-center justify-between bg-black/60 px-4 py-2.5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400/80">Live Route</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>🛵 You</span>
                    <span>📦 Drop</span>
                </div>
            </div>
            <MapContainer
                center={riderPosition || deliveryLocation}
                zoom={13}
                style={{ height: "320px", width: "100%" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={riderPosition || [0, 0]} icon={riderIcon}>
                    <Popup>You (Rider)</Popup>
                </Marker>
                <Marker position={deliveryLocation || [0, 0]} icon={deliveryIcon}>
                    <Popup>Delivery Location</Popup>
                </Marker>
                <Routing from={riderPosition || [0, 0]} to={deliveryLocation} />
            </MapContainer>
        </div>
    );
};

export default OrderMap;
