import React from "react";
import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Forgetpassword from "./components/Forgetpassword";
import { useAuth } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import Resetpassword from "./components/Resetpassword";
import ChangeProfile from "./components/ChangeProfile";

import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              // <div className="flex h-screen">
              //   <Left />
              //   <Right />
              // </div>
              <div className="drawer lg:drawer-open">
                <input
                  id="my-drawer-2"
                  type="checkbox"
                  className="drawer-toggle"
                />
                <div className="drawer-content flex flex-col items-center justify-center">
                  <Right />
                </div>
                <div className="drawer-side">
                  <label
                    htmlFor="my-drawer-2"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                  ></label>
                  <ul className="menu w-80 min-h-full bg-black text-base-content">
                    <Left />
                  </ul>
                </div>
              </div>
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/forget-password"
          element= {  <Forgetpassword /> }
        />

        <Route
          path="/reset-password/:token"
          element= {  <Resetpassword /> }
        />

         <Route
          path="/changeprofile"
          element= {authUser ? <ChangeProfile /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
