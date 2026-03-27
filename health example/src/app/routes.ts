import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { EmergencyDashboard } from "./pages/EmergencyDashboard";
import { BloodFinder } from "./pages/BloodFinder";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "emergency", Component: EmergencyDashboard },
      { path: "blood-finder", Component: BloodFinder },
      { path: "*", Component: Home },
    ],
  },
]);
