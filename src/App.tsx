import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, AuthLoading } from "convex/react";
import Welcome from "./pages/Welcome";
import Camera from "./pages/Camera";
import Canvas from "./pages/Canvas";
import Dashboard from "./pages/Dashboard";
import Join from "./pages/Join";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";

function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center">
      <p
        className="text-stone text-sm"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 300, letterSpacing: "0.1em" }}
      >
        Loading...
      </p>
    </div>
  );
}

function ProtectedDashboard() {
  return (
    <>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/join/:inviteCode" element={<Join />} />
        <Route path="/c/:slug/camera" element={<Camera />} />
        <Route path="/c/:slug/canvas" element={<Canvas />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
