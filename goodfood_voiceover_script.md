# 🎬 GOODFOOD — Full Dry-Run Voiceover Script
### *Microservices-Based Food Delivery Platform*
> **Duration:** ~8–10 minutes | **Format:** Screen-recording walkthrough  
> **Use for:** Project pitch · Technical interview · Portfolio demo

---

## 📋 PRE-RECORDING CHECKLIST

Before you start recording, make sure these are running:

```bash
npm run dev          # Starts ALL 7 services concurrently
```

| Service         | Port   | Purpose                          |
|-----------------|--------|----------------------------------|
| Frontend (Vite) | 5173   | React + TypeScript SPA           |
| Auth Service    | 3000   | Authentication, Google OAuth, Geocoding |
| Restaurant Svc  | 3001   | Restaurants, Menu, Cart, Address, Orders |
| Utils Service   | 3002   | Cloudinary uploads, Razorpay payments |
| Realtime Svc    | 3003   | Socket.IO server for live events |
| Rider Service   | 3004   | Rider profiles, order assignment, delivery |
| Admin Service   | 3006   | Admin panel, verification workflows |

> Also ensure: MongoDB running, RabbitMQ running, `.env` files configured for each service.

---

## 🎤 SCRIPT BEGINS

---

### ⏱️ [0:00 – 0:40] — OPENING & PROJECT INTRODUCTION

**[SCREEN: Show the GOODFOOD login page — the full branded landing]**

> *"Hey everyone — welcome! Today I'm going to walk you through **GOODFOOD**, a full-stack food delivery platform that I built from scratch using a **microservices architecture**."*
>
> *"Think of it as a Zomato or Swiggy clone — but designed with a real production-grade backend. This isn't a monolith. It's **6 independent backend services** that communicate through **REST APIs**, **RabbitMQ message queues**, and **Socket.IO for real-time events** — all orchestrated to deliver a seamless food ordering experience."*
>
> *"On the frontend, I'm using **React with TypeScript**, styled with **Tailwind CSS**, and the whole stack uses **Node.js, Express, and MongoDB** on the backend."*
>
> *"The platform supports **4 distinct user roles** — **Customer**, **Restaurant Owner**, **Delivery Rider**, and **Admin** — each with their own dedicated interface and workflow. Let me show you everything."*

---

### ⏱️ [0:40 – 1:30] — ARCHITECTURE OVERVIEW

**[SCREEN: Switch to a tab showing the project structure in VS Code — show `package.json` with the `concurrently` scripts]**

> *"Before we dive into the UI, let me quickly walk you through the architecture."*
>
> *"Here in the root `package.json`, you can see I'm using **concurrently** to spin up all services at once with a single `npm run dev` command. There are **6 backend microservices** plus the frontend — that's 7 processes running in parallel."*

**[SCREEN: Briefly show each service folder — `services/auth`, `services/restaurant`, `services/rider`, `services/realtime`, `services/utils`, `services/admin`]**

> *"Here's how the services are split:"*
>
> *"**Auth Service** on port 3000 — handles user registration, login with email/password, **Google OAuth** via authorization code flow, JWT token generation, role assignment, and reverse geocoding for location."*
>
> *"**Restaurant Service** on port 3001 — this is the heaviest service. It manages restaurants, menu items, the shopping cart, delivery addresses, and the entire order lifecycle. It also runs a **RabbitMQ consumer** that listens for payment success events."*
>
> *"**Utils Service** on port 3002 — handles **Cloudinary** image uploads and **Razorpay** payment creation and verification. After verifying a payment, it publishes a `PAYMENT_SUCCESS` event to RabbitMQ."*
>
> *"**Realtime Service** on port 3003 — a dedicated **Socket.IO** server. It authenticates socket connections using JWT, assigns users to rooms based on their role — like `user:userId`, `restaurant:restaurantId`, `rider:riderId` — and enables real-time event broadcasting."*
>
> *"**Rider Service** on port 3004 — manages rider profiles, availability toggling with geolocation, order acceptance, status updates, OTP verification for delivery, and earnings tracking. It also consumes a RabbitMQ queue for 'order ready for rider' events."*
>
> *"**Admin Service** on port 3006 — provides endpoints for the admin to view pending restaurants and riders, and verify them."*

---

### ⏱️ [1:30 – 2:20] — AUTHENTICATION & ROLE SELECTION

**[SCREEN: Show the Login page — the beautiful split layout with brand on left, auth card on right]**

> *"Let's start from the very beginning — the login page."*
>
> *"I've built a clean, premium UI here. On the left, you see the GOODFOOD branding with feature pills — '1000+ restaurants', '30 min delivery', 'Live tracking'. On the right is the auth card."*
>
> *"Users can toggle between **Login** and **Sign Up** modes. There are **two authentication flows**:"*
>
> *"First — traditional **email and password** auth. On signup, the backend hashes the password, creates the user in MongoDB, and returns a JWT token which gets stored in localStorage."*
>
> *"Second — **Google OAuth**. I'm using the `@react-oauth/google` package with the **authorization code flow**. The user clicks 'Continue with Google', Google returns an auth code, which I send to my Auth Service backend. The backend exchanges that code with Google's servers to get the user profile, creates or finds the user, and returns a JWT."*

**[SCREEN: After login, show the Role Selection page]**

> *"After first-time login, the user lands on this **Role Selection** page. This is a crucial design decision — a single user can choose to be a **Customer**, a **Rider**, or a **Restaurant Owner**."*
>
> *"Each role card has a clear description. The user selects one, hits Continue, and the backend updates their role via a `PUT /api/auth/add/role` endpoint. The JWT is re-issued with the new role embedded, and the frontend re-routes them to the appropriate dashboard."*
>
> *"This role-based routing happens right in `App.tsx` — if the role is 'rider', they see the Rider Dashboard. If 'owner', they see the Restaurant management panel. If 'admin', the Admin Panel. And the default is the Customer interface."*

---

### ⏱️ [2:20 – 4:00] — CUSTOMER FLOW

**[SCREEN: Show the Home page with nearby restaurants]**

> *"Now let's walk through the **Customer Journey** — the core of the platform."*
>
> *"On the home page, the app uses the **Browser Geolocation API** to get the customer's latitude and longitude. It then calls my Auth Service's reverse geocoding endpoint — which proxies to **Nominatim / OpenStreetMap** — to get a human-readable address and city name."*
>
> *"With this location, it fetches nearby restaurants from the Restaurant Service. The backend uses **MongoDB's geospatial queries** — `$geoNear` with a `2dsphere` index — to find restaurants within a radius and return them sorted by distance. Each card shows the restaurant name, image, description, distance in kilometers, and an open/closed status badge with a pulsing dot."*

**[SCREEN: Click on an open restaurant]**

> *"When the customer taps on a restaurant, they see the restaurant's full menu. Each menu item has a name, description, price, image, and availability status. The customer can **add items to their cart** directly from here."*
>
> *"The cart is managed server-side — stored in MongoDB — not just in local state. This means if you switch devices, your cart persists."*

**[SCREEN: Navigate to the Cart page]**

> *"Here's the **Cart** page. It shows all items with their images, prices, quantities, and the restaurant they belong to. You can increment, decrement, or clear the entire cart."*
>
> *"The order summary on the right shows the subtotal, delivery fee — which is **₹49 if order is under ₹250, free otherwise** — a platform fee of ₹7, and the grand total. There's also a smart nudge that tells you exactly how much more to add for free delivery."*

**[SCREEN: Click 'Proceed to Checkout']**

> *"On the **Checkout** page, the customer first selects a delivery address. They can add new addresses — each with a formatted address and mobile number. Previously saved addresses appear as selectable cards."*
>
> *"Once an address is selected, the 'Pay' button becomes active. I calculate the delivery distance using the **Haversine formula** — computing the great-circle distance between the restaurant's GeoJSON coordinates and the customer's location."*

**[SCREEN: Click Pay — show Razorpay modal opening]**

> *"When the customer hits Pay, here's what happens under the hood:"*
>
> 1. *"A new Order is created in the Restaurant Service with status `placed` and payment status `pending`. The order includes an auto-generated **OTP** for delivery verification."*
> 2. *"The Utils Service creates a **Razorpay order** using the Razorpay SDK."*
> 3. *"The Razorpay checkout modal opens on the frontend."*
> 4. *"After successful payment, Razorpay sends back the `razorpay_order_id`, `payment_id`, and `signature`."*
> 5. *"The Utils Service **verifies the signature** using HMAC-SHA256 — this is critical for security — and then publishes a `PAYMENT_SUCCESS` event to **RabbitMQ**."*
> 6. *"The Restaurant Service's **payment consumer** picks up this event, marks the order as `paid`, removes the TTL expiry, and then makes an internal HTTP call to the **Realtime Service** to emit an `order_new` event to the restaurant's Socket.IO room."*
>
> *"This is the power of the microservices pattern — each service does its own job, and they communicate through message queues for reliability."*

**[SCREEN: Show the Payment Success page, then the Order Details page]**

> *"After payment, the customer is redirected to the payment success page, and then can track their order with all details — items ordered, restaurant name, delivery address, order status, and the OTP they'll need to give the rider upon delivery."*

---

### ⏱️ [4:00 – 5:30] — RESTAURANT OWNER FLOW

**[SCREEN: Log in as a Restaurant Owner — show the restaurant dashboard with dark theme]**

> *"Now let's switch to the **Restaurant Owner's** perspective."*
>
> *"When a new owner first logs in, they see a **Create Restaurant** form where they fill in the restaurant name, description, phone number, and upload an image — which gets uploaded to **Cloudinary** via the Utils Service. The restaurant's location is auto-detected using the browser's geolocation and reverse geocoding."*
>
> *"After creation, the restaurant is **not yet visible to customers** — it enters a `pending verification` state. The admin must approve it first. This is an important moderation layer."*

**[SCREEN: Show the restaurant dashboard with orders, the toggle, and the notification banner]**

> *"Once verified, the owner sees their full dashboard. Key features:"*
>
> *"**Open/Close Toggle** — The owner can toggle their restaurant's availability. When closed, their restaurant appears greyed out with a 'CLOSED' badge on the customer side."*
>
> *"**Sound Notifications** — There's a notification banner prompting the owner to enable audio. When a new order comes in via Socket.IO, an **audio alert plays** — using a preloaded Audio element that's unlocked on user gesture to comply with browser autoplay policies."*
>
> *"**Real-time Order Alerts** — The restaurant listens on its Socket.IO room `restaurant:{restaurantId}` for `order_new` events. When triggered, a toast notification appears, the sound plays, and the order list auto-refreshes."*
>
> *"The owner can then manage incoming orders — **accept** them, mark them as **preparing**, and when the food is ready, mark them as **ready for rider**. This status change triggers another event that notifies nearby available riders via RabbitMQ."*

**[SCREEN: Show the Edit Restaurant page and Add Menu Items]**

> *"The owner can also **edit their restaurant details** and **manage the menu** — add new items with name, description, price, and image. They can toggle item availability on or off."*

---

### ⏱️ [5:30 – 7:00] — DELIVERY RIDER FLOW

**[SCREEN: Log in as a Rider — show the registration form first]**

> *"Now the **Rider** flow. When a rider first signs up and selects the Rider role, they see a **registration form** asking for their profile picture, phone number, Aadhaar number, and driving license number. The picture is uploaded as a multipart form to the Rider Service."*
>
> *"Like restaurants, riders also need **admin verification** before they can start delivering. The rider model uses a **MongoDB 2dsphere geospatial index** on their location — this is crucial for finding the nearest available riders when an order is ready."*

**[SCREEN: Show the verified Rider Dashboard]**

> *"Once verified, the rider sees their dashboard. It shows their profile picture, phone number, online/offline status, verification status, current city, and last active date."*
>
> *"The rider can **go online or offline** — toggling availability. When going online, the app captures their current GPS coordinates and sends them to the backend, updating their geolocation in the database."*
>
> *"There's also an **Earnings tab** where riders can view their delivery earnings and history."*

**[SCREEN: Show an incoming order notification on the rider dashboard]**

> *"When a restaurant marks an order as 'ready for rider', the Rider Service's **RabbitMQ consumer** picks up the event. It queries for nearby available riders using `$geoNear`, calculates the rider's pay based on distance, and then the Realtime Service emits an `order_ready_for_rider` event to eligible rider Socket rooms."*
>
> *"The rider's dashboard listens for this event. When it arrives — a **push notification card** appears with the order amount, distance, and an Accept button. There's a 10-second auto-expiry on the offer. If the rider doesn't accept, it disappears."*
>
> *"The sound notification plays here too — same browser audio unlock pattern."*

**[SCREEN: Accept an order — show Current Order view with map]**

> *"Once the rider accepts, they see the **Current Order** panel with full order details — items, delivery address, customer info. Below that is a **Leaflet map** showing the pickup and delivery locations with markers."*
>
> *"The rider then progresses through statuses — **picked up** → **on the way**. When they arrive, they need to enter the **OTP** that the customer received. The backend verifies this OTP hash — this prevents false deliveries. Once verified, the order is marked **delivered**."*

---

### ⏱️ [7:00 – 7:50] — ADMIN PANEL

**[SCREEN: Log in as Admin — show the Admin Panel]**

> *"Finally, the **Admin Panel**. This is the control center of the platform."*
>
> *"The admin has two tabs — **Restaurants** and **Riders** — each showing pending verification requests."*
>
> *"For restaurants, the admin sees the restaurant image, name, description, phone number, formatted address, and owner ID. They can **approve** with a single click."*
>
> *"For riders, they see the profile picture, phone number, Aadhaar number, driving license number, availability status, and coordinates. Again, one-click approval."*
>
> *"Once approved, the restaurant becomes visible to customers, and the rider can start receiving delivery requests. This verification layer adds a trust and safety mechanism to the platform — similar to what real food delivery apps implement."*

---

### ⏱️ [7:50 – 9:00] — TECHNICAL DEEP DIVE & KEY HIGHLIGHTS

**[SCREEN: Show the code / architecture diagram (optional)]**

> *"Let me quickly summarize the **key technical highlights** of this project:"*
>
> *"**Microservices Architecture** — 6 independent Node.js services, each with its own database connection, running on separate ports. They're loosely coupled, independently deployable, and each has its own Dockerfile for containerization."*
>
> *"**Message Queue with RabbitMQ** — Used for async communication between services. The payment flow and rider assignment flow both use publish-subscribe patterns through RabbitMQ. This ensures no data loss even if a service is temporarily down."*
>
> *"**Real-time with Socket.IO** — A dedicated realtime service handles WebSocket connections. It authenticates sockets via JWT, manages room-based broadcasting for restaurants, riders, and customers. Events like `order_new` and `order_ready_for_rider` flow through this."*
>
> *"**Payment Integration — Razorpay** — Full payment flow with order creation, checkout modal, and **cryptographic signature verification** using HMAC-SHA256 for tamper-proof payment confirmation."*
>
> *"**Google OAuth 2.0** — Authorization code flow, not implicit. The frontend gets an auth code, the backend exchanges it server-side — the secure, production-recommended approach."*
>
> *"**Geospatial Queries** — MongoDB 2dsphere indexes on both restaurants and riders for proximity-based lookups. Distance calculations use the Haversine formula on the frontend and `$geoNear` on the backend."*
>
> *"**OTP-Based Delivery Verification** — When an order is placed, an OTP is generated and hashed. The customer sees the OTP; the rider must enter it to complete delivery. This prevents fraudulent deliveries."*
>
> *"**Cloudinary Integration** — For image uploads across restaurants, menu items, and rider profiles — all handled through the Utils Service."*
>
> *"**Role-Based Access Control** — Single authentication system with role-based routing. The JWT contains the user's role, and both frontend routing and backend middleware enforce access based on it."*
>
> *"**Docker-Ready** — Each service has its own Dockerfile and `.dockerignore`, making it ready for containerization and deployment."*

---

### ⏱️ [9:00 – 9:40] — CLOSING

**[SCREEN: Show the home page one more time with restaurants loaded]**

> *"So to recap — **GOODFOOD** is a full-stack, microservices-based food delivery platform with:"*
>
> - *"6 backend services communicating via REST, RabbitMQ, and Socket.IO"*
> - *"4 user roles — Customer, Owner, Rider, Admin — each with dedicated workflows"*
> - *"Secure Razorpay payments with cryptographic verification"*
> - *"Real-time order updates and push notifications"*
> - *"Geospatial restaurant and rider discovery"*
> - *"OTP-secured delivery verification"*
> - *"Google OAuth and email/password authentication"*
> - *"Docker-ready, independently deployable services"*
>
> *"This project demonstrates my understanding of **distributed systems**, **event-driven architecture**, **real-time communication**, **payment integrations**, and **building scalable, production-grade applications**."*
>
> *"Thanks for watching! If you have any questions about the architecture or implementation, I'd love to discuss them."*

---

## 🗂️ QUICK REFERENCE — INTERVIEW TALKING POINTS

Use these if someone asks follow-up questions:

| Topic | Key Answer |
|-------|-----------|
| **Why Microservices?** | Separation of concerns, independent scaling, fault isolation. If the payment service goes down, restaurant browsing still works. |
| **Why RabbitMQ over direct HTTP?** | Decoupling + reliability. If the restaurant service is temporarily down when payment succeeds, the message stays in the queue and gets processed when it recovers. |
| **Why Socket.IO over SSE/polling?** | Bi-directional communication needed (rider joins rooms dynamically). Socket.IO also handles reconnection and fallback to polling gracefully. |
| **Why server-side cart?** | Cart persistence across devices and sessions. Also prevents price tampering — server calculates totals, not the client. |
| **Why OTP for delivery?** | Prevents fraudulent deliveries. The rider physically confirms delivery with the customer. Same approach used by Zomato/Swiggy. |
| **Why Auth Code flow for Google OAuth?** | More secure than implicit flow. The access token never touches the browser — it's exchanged server-to-server. |
| **How do you find nearby riders?** | MongoDB `$geoNear` aggregation with `2dsphere` index on rider location. Filters by `isAvailable: true` and `isVerified: true`, sorted by proximity. |
| **How is the order status tracked?** | Enum-based state machine: `placed → accepted → preparing → ready_for_rider → rider_assigned → picked_up → delivered`. Each transition triggers realtime events. |
| **What if payment succeeds but order creation fails?** | The order is created BEFORE payment with an `expiresAt` TTL. If payment never confirms, MongoDB auto-deletes it. If payment succeeds, the TTL is removed. |
| **Scaling strategy?** | Each service is stateless (JWT auth, no sessions). Can be horizontally scaled behind a load balancer. RabbitMQ handles distributed message processing. |

---

## 🎯 RECORDING TIPS

1. **Use 4 browser profiles** — one for each role (Customer, Owner, Rider, Admin) so you can switch between them quickly during the demo.
2. **Pre-populate data** — Have at least 2-3 restaurants with menu items, a verified rider, and some existing orders so the demo feels real.
3. **Show the full order lifecycle** — Place an order as Customer → Accept as Owner → Mark ready → Accept as Rider → Deliver with OTP. This end-to-end flow is the most impressive part.
4. **Keep terminal visible** — Show the 7 services running concurrently in the terminal. Console logs like "✅ Socket Connected" and "New order received! 🎉" add authenticity.
5. **Speak confidently about trade-offs** — Interviewers love hearing WHY you made certain choices, not just WHAT you built.
