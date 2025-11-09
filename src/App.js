import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Write from "./components/WriteWithNewAuth";
import Register from "./components/register";
import Dashboard from "./components/dashboard";
import Homepage from "./components/Homepage";
import LandPage from "./components/landPage";
import Category from "./components/Category";
import Breakfast from "./components/Breakfast";
import CategoryPage from "./components/CategoryPage";
import Cart from "./components/Cart";
import Admin from "./components/AdminFiles/admin";

function App() {
  return (
    <div className="App" style={{ height: '100vh', overflow: 'auto' }}>
      <Router>
        <Routes>
          <Route path="/" element={<LandPage />}/>
          <Route path="/login" element={<Write />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/home" element={<Homepage />}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/category" element={<Category />}/>
          <Route path="/breakfast" element={<Breakfast />}/>
          <Route path="/cart" element={<Cart />}/>
          <Route path="/admin" element={<Admin />}/>
          <Route path="/:categoryId" element={<CategoryPage />}/>
        </Routes>
      </Router>
    </div>
    )
}

export default App;
