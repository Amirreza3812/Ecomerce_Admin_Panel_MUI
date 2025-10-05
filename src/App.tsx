import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexes/AuthContext";
import SignIn from "./Pages/Sign_in/SignIn.tsx";
import Dashboard from "./Pages/Dashboard/Dashboard.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import RedirectIfAuth from "./routes/RedirectIfAuth.tsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <RedirectIfAuth>
                  <SignIn />
                </RedirectIfAuth>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* هر مسیر محافظت‌شده دیگه اینجا اضافه کن */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
