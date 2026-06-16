import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";
import SelectRoles from "./pages/select-roles";
import Navbar from "./components/customer/Navbar";
import Account from "./components/customer/Account";
import { useAppContext } from "./context/context";
import Restaurant from "./pages/restaurant";
import EditRestaurant from "./components/restaurant/editrestauran";
import CustomerResView from "./components/customer/customerResView";
import Cart from "./pages/Cart";
import AddAddress from "./components/customer/AddAddress";
import Checkout from "./pages/checkout";
import PaymentSuccess from "./pages/paymentSucces";
import ViewOrderDetails from "./components/customer/ViewOrderDetails";
import Dashboard from "./components/rider/dashboard";
import { Admin } from "./pages/Admin";

function App() {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#ff385c] border-t-transparent shadow-sm" />
          <span className="font-serif text-xl font-bold tracking-wide text-[#111111]">GOODFOOD</span>
        </div>
      </div>
    );
  }

  if (user?.role === "rider") {
    return(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    )
  }

  if (user?.role === "owner") {
    return (
      <BrowserRouter>
        <Routes >
          <Route></Route>
          <Route path="/edit-restaurant" element={<EditRestaurant />} />
          <Route path="/" element={<Restaurant />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    )
  }

  if (user?.role === "admin") {
    return <Admin />
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<PublicRoute/>}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute/>}>
          <Route path="/" element={<Home />} />
          <Route path="/AddAddress" element={<AddAddress/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
          <Route path="/account" element={<Account />} />
          <Route path="/select-role" element={<SelectRoles />} />
          <Route path="/restaurant/:id" element={<CustomerResView/>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order/:orderId" element={<ViewOrderDetails/>} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
