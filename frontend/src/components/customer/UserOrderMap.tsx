import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import { useEffect } from "react";

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
  }, [from, to]);
  return null;
};

interface UserOrderMapProps {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

export const UserOrderMap = ({ riderLocation, deliveryLocation }: UserOrderMapProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Tracking</p>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>🛵 Rider</span>
          <span>📦 Your Door</span>
        </div>
      </div>
      <MapContainer
        center={riderLocation || deliveryLocation}
        zoom={13}
        style={{ height: "320px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={riderLocation || [0, 0]} icon={riderIcon}>
          <Popup>Rider is here</Popup>
        </Marker>
        <Marker position={deliveryLocation || [0, 0]} icon={deliveryIcon}>
          <Popup>Your delivery location</Popup>
        </Marker>
        <Routing from={riderLocation || [0, 0]} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};
