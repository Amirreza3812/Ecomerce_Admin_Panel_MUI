// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexes/AuthContext.tsx";
import { ModuleProvider, useModules } from "./contexes/ModuleContext.tsx";
import SignIn from "./Pages/Sign_in/SignIn.tsx";
import Dashboard from "./Pages/Dashboard/DashboardLayout.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import RedirectIfAuth from "./routes/RedirectIfAuth.tsx";
// ... all page imports (Orders, Banking, etc.)
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
import MyAccount from "./Pages/MyAccount/MyAccount.tsx";

const DashboardIndex = () => <MainGrid />;
const queryClient = new QueryClient();

function AppRoutes() {
  const { modules, isLoading } = useModules();

  if (isLoading) {
    return <div>Loading modules...</div>;
  }

  return (
    <Routes>
      {/* 
         CHANGED 1: The Root path / now redirects to /admin (Login)
         This ensures the site doesn't show a blank page at the root.
      */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* 
         CHANGED 2: Login (SignIn) is now at /admin 
      */}
      <Route
        path="/admin"
        element={
          <RedirectIfAuth>
            <SignIn />
          </RedirectIfAuth>
        }
      />

      <Route element={<ProtectedRoute />}>
        {/* 
           Dashboard remains at /admin/dashboard
        */}
        <Route path="/admin/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardIndex />} />

          {/* ... conditionals ... */}
          {modules?.banking && <Route path="banking" element={<Banking />} />}
          {modules?.categories && (
            <Route path="categories" element={<Categories />} />
          )}
          {/* ... keep the rest of your conditional routes here ... */}
          {modules?.prices && <Route path="prices" element={<Price />} />}
          {modules?.orders && <Route path="orders" element={<Orders />} />}
          {modules?.products && (
            <Route path="products" element={<Products />} />
          )}
          {modules?.customers && (
            <Route path="customers" element={<Customer />} />
          )}
          {modules?.comments && <Route path="comments" element={<Comment />} />}
          {modules?.personnel && (
            <Route path="personnel" element={<Personnel />} />
          )}
          {modules?.settings && (
            <Route path="settings" element={<Settings />} />
          )}
          {modules?.about && <Route path="about" element={<About />} />}
          {modules?.feedback && (
            <Route path="feedback" element={<Feedback />} />
          )}
          {modules?.subcategories && (
            <Route path="subcategories" element={<SubCategories />} />
          )}
          {modules?.myAccount && (
            <Route path="myAccount" element={<MyAccount />} />
          )}
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModuleProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ModuleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
