import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "../App";
import Login from "../pages/Login";
import Register from "../pages/Register";

const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/home",
      element: <App />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: <Login />,
    },
    
  ]);
  return <RouterProvider router={router} />;
};

export default AppRouter;
