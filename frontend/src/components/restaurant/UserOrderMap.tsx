import { MapContainer,TileLayer,Marker,Popup,useMap } from "react-leaflet";
import * as L from "leaflet";
import 'leaflet-routing-machine'
import 'leaflet/dist/leaflet.css';
import { useEffect } from"react";

declare module "leaflet" {
  namespace Routing {
      function control(options: any):any
      function osrmv1(options: any): any;   
  }
}
const riderIcon = new L.DivIcon({
  html: "🛵",
  // '<div style="background-color: #007bff; border: 2px solid #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-motorcycle" style="color: white;"></i></div>',
  iconSize: [30, 30],
  className: "rider-icon",
});

const deliveryIcon = new L.DivIcon({
  html: "📦",
  // '<div style="background-color: #28a745; border: 2px solid #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-box" style="color: white;"></i></div>',
  iconSize: [30, 30],
  className: "delivery-icon",
}); 


const Routing = ({
  from,
  to}:{
    from:[number,number],
    to:[number,number]
  
})=>{
  const map = useMap();
  useEffect(()=>{
    const control = L.Routing.control({
      waypoints:[
        L.latLng(from),L.latLng(to)
      ],
      lineOptions:{
        styles:[
          {color:"#E23744", weight:3 }]
      },
      addWaypoints:false,
      draggableWaypoints:false,
      show:false,
      createMarker:()=> null,
      router:L.Routing.osrmv1({
        serviceUrl:"https://router.project-osrm.org/route/v1"
      })
    }).addTo(map);

    return ()=>{
      map.removeControl(control);
    }
  },[from,to])
  return null;
}

interface UserOrderMapProps {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}
export const UserOrderMap = ({ riderLocation, deliveryLocation }: UserOrderMapProps) => {
  return (
  <div>
      <MapContainer center={riderLocation || deliveryLocation} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={riderLocation || [0,0]} icon={riderIcon}>
        <Popup> You(Rider) </Popup>
      </Marker>
       <Marker position={deliveryLocation || [0,0]} icon={deliveryIcon}>
        <Popup> Delivery Location </Popup>
      </Marker>
      <Routing from = {riderLocation || [0,0]} to={deliveryLocation}/>
      </MapContainer>
    </div>
    )};
