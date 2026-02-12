import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import AdminEventsPage from "./pages/AdminEventsPage.tsx";
import EventFormPage from "./pages/EventFormPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route
              path="admin"
              element={
                <RequireAuth>
                  <AdminEventsPage />
                </RequireAuth>
              }
            />
            <Route
              path="admin/events/new"
              element={
                <RequireAuth>
                  <EventFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="admin/events/:id/edit"
              element={
                <RequireAuth>
                  <EventFormPage />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
