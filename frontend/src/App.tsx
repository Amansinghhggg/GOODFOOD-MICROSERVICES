import {BrowserRouter , Routes , Route} from "react-router-dom"
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";
import SelectRoles from "./pages/select-roles";
import Navbar from "./components/Navbar";
import Account from "./components/Account";
function App() {
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
