# 🍔 GOODFOOD Microservices Platform

**GOODFOOD** is a full-stack, production-grade food delivery platform (similar to Zomato or Swiggy) built with a **microservices architecture**. It features 6 independent backend services communicating via REST APIs, RabbitMQ, and Socket.IO, along with a modern React frontend.

The platform supports 4 distinct user roles: **Customer**, **Restaurant Owner**, **Delivery Rider**, and **Admin**, each with dedicated workflows and dashboards.

---

## 🏗️ Architecture Overview

The application is broken down into 7 concurrent processes (1 Frontend + 6 Microservices) managed via `concurrently` during development.

| Service | Port | Description |
| :--- | :--- | :--- |
| **Frontend** | `5173` | React + TypeScript SPA (Vite, Tailwind CSS, Leaflet). |
| **Auth Service** | `3000` | User registration, Login, Google OAuth 2.0, JWT generation, Role management, and Reverse Geocoding. |
| **Restaurant Service** | `3001` | Manages restaurants, menus, shopping cart, delivery addresses, and the order lifecycle. Consumes RabbitMQ payment success events. |
| **Utils Service** | `3002` | Handles Cloudinary image uploads and Razorpay payment creation/verification. Publishes to RabbitMQ on payment success. |
| **Realtime Service** | `3003` | Dedicated Socket.IO server for live events (order updates, rider assignment). Uses JWT for socket authentication. |
| **Rider Service** | `3004` | Manages rider profiles, real-time availability (GPS), order acceptance, OTP delivery verification, and earnings. |
| **Admin Service** | `3006` | Admin dashboard backend for verifying and approving new restaurants and riders. |

---

## 🚀 Tech Stack

### Frontend
* **Core:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS 4
* **Routing:** React Router DOM
* **State/Realtime:** Socket.IO Client
* **Maps:** Leaflet, React-Leaflet
* **Icons:** Lucide React, React Icons

### Backend (Microservices)
* **Core:** Node.js, Express.js, TypeScript
* **Database:** MongoDB (with Mongoose), featuring `2dsphere` geospatial indexes for location-based queries
* **Message Broker:** RabbitMQ (`amqplib`) for asynchronous event-driven communication
* **Realtime:** Socket.IO
* **Security:** JWT (JSON Web Tokens), bcrypt for password hashing

### Third-Party Integrations
* **Payments:** Razorpay with HMAC-SHA256 signature verification
* **Authentication:** Google OAuth 2.0 (Authorization Code Flow)
* **Storage:** Cloudinary for image uploads
* **Mapping/Geocoding:** Nominatim / OpenStreetMap API

---

## ✨ Key Features

* **Microservices & Event-Driven Design:** Services are loosely coupled. Payment success and Rider assignments are handled asynchronously via RabbitMQ to ensure reliability and fault tolerance.
* **Real-time Communication:** Socket.IO is used to broadcast new orders to restaurants, order status updates to customers, and delivery requests to nearby riders instantly. Audio notifications are integrated for critical events.
* **Geospatial Lookups:** Uses MongoDB's `$geoNear` aggregation and `2dsphere` indexes to find restaurants and available riders near the customer's coordinates.
* **OTP-Secured Delivery:** To prevent fraudulent deliveries, an OTP is generated upon order placement. The rider must collect and verify this OTP from the customer to mark the order as delivered.
* **Role-Based Access Control (RBAC):** A single authentication system dynamically routes users to their respective dashboards (Customer, Owner, Rider, Admin) based on their assigned role in the JWT.
* **Admin Moderation Workflow:** New restaurants and riders are placed in a `pending` state upon registration and require manual verification by the Admin before going live.
* **Server-Side Cart Management:** User shopping carts are persisted in the database, allowing seamless cross-device synchronization and preventing client-side price tampering.

---

## 🛠️ Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB (running locally or via Atlas)
* RabbitMQ (running locally or via Docker)
* API Keys: Google OAuth Client ID/Secret, Razorpay Key/Secret, Cloudinary Credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amansinghhggg/GOODFOOD-MICROSERVICES.git
   cd GOODFOOD-MICROSERVICES
   ```

2. **Install dependencies for all services**
   Navigate to the root directory and install dependencies. Note: You will need to install dependencies for the root, frontend, and each service.

3. **Environment Configuration**
   Create a `.env` file in each microservice directory (`services/auth`, `services/restaurant`, etc.) and the `frontend` directory, and populate them with the required environment variables.

4. **Run the entire platform**
   From the root directory, start all services concurrently:
   ```bash
   npm run dev
   ```
   This command uses `concurrently` to launch the frontend on port 5173 and all 6 backend services on their respective ports.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Amansinghhggg/GOODFOOD-MICROSERVICES/issues).

## 📝 License
This project is licensed under the ISC License.
