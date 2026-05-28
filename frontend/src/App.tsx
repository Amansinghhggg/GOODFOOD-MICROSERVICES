import {BrowserRouter , Routes , Route} from "react-router-dom"
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";
import SelectRoles from "./pages/select-roles";
import Navbar from "./components/Navbar";
import Account from "./components/Account";
import { useAppContext } from "./context/context";
import Restaurant from "./pages/restaurant";
import EditRestaurant from "./components/restaurant/editrestauran";
function App() {
  const { user } = useAppContext();

  if(user?.role === "owner") {
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
  return (
    <BrowserRouter>
      {/* {user?.role && <Navbar />} */}
      <Navbar />
      <Routes>
        <Route element={<PublicRoute/>}>
        <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute/>}>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/select-role" element={<SelectRoles />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
