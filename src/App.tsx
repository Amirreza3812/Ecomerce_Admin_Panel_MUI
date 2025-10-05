import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexes/AuthContext.tsx";
import SignIn from "./Pages/Sign_in/SignIn.tsx";
import Dashboard from "./Pages/Dashboard/DashboardLayout.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import RedirectIfAuth from "./routes/RedirectIfAuth.tsx";
import Orders from "./Pages/Orders/Orders.tsx";
import Banking from "./Pages/Banking/Banking.tsx";
import Categories from "./Pages/Categories/Categories.tsx";
import Price from "./Pages/Prices/Price.tsx";
import Products from "./Pages/Products/Products.tsx";
import Customer from "./Pages/Customer/Customer.tsx";
import Comment from "./Pages/Comment/Comment.tsx";
import Personnel from "./Pages/Personnel/Personnel.tsx";
import Settings from "./Pages/Settings/Setting.tsx";
import About from "./Pages/About/About.tsx";
import Feedback from "./Pages/Feedback/Feedback.tsx";
import MainGrid from "./Pages/Dashboard/components/MainGrid.tsx";
import SubCategories from "./Pages/SubCategories/SubCategories.tsx";

// Let's create a default component for the dashboard index page
// You can replace this with your MainGrid component later
const DashboardIndex = () => <MainGrid />;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route
              path="/"
              element={
                <RedirectIfAuth>
                  <SignIn />
                </RedirectIfAuth>
              }
            />

            {/* Protected Routes with a common layout */}
            <Route element={<ProtectedRoute />}>
              {/* This is the parent route. It renders the Dashboard layout (Sidebar, Navbar, etc.) */}
              <Route path="/dashboard" element={<Dashboard />}>
                {/* The `index` route renders when the path is JUST "/dashboard" */}
                <Route index element={<DashboardIndex />} />

                {/* These are child routes. They will render inside the <Outlet /> in DashboardLayout.tsx */}
                <Route path="orders" element={<Orders />} />
                <Route path="banking" element={<Banking />} />
                <Route path="categories" element={<Categories />} />
                <Route path="prices" element={<Price />} />
                <Route path="products" element={<Products />} />
                <Route path="customers" element={<Customer />} />
                <Route path="comments" element={<Comment />} />
                <Route path="personnel" element={<Personnel />} />
                <Route path="settings" element={<Settings />} />
                <Route path="about" element={<About />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="subcategories" element={<SubCategories />} />

                {/* Add other child routes here */}
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
