import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Forgetpassword() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const userInfo = {
      email: data.email,
    };
    console.log(userInfo);
    axios
      .post("/api/user/forget-password", userInfo)
      .then((response) => {
        if (response.data) {
            console.log(response.data);
          toast.success(response.data.message);
        }
      })
      .catch((error) => {
        if (error.response) {
          toast.error("Error: " + error.response.data.error);
        }
      });
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border border-white px-6 py-2 rounded-md space-y-3 w-96"
        >
          <h1 className="text-2xl text-center">
            Chat<span className="text-green-500 font-semibold">App</span>
          </h1>
          <h2 className="text-xl text-white font-bold">forget password</h2>
          <br />

          {/* Email */}
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 opacity-70"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input
              type="text"
              className="grow"
              placeholder="Email"
              {...register("email", { required: true })}
            />
          </label>
          {errors.email && (
            <span className="text-red-500 text-sm font-semibold">
              This field is required
            </span>
          )}

         
          {/* Text & Button */}
          <div className="flex justify-between">
            <p>
              New user?
              <Link
                to="/signup"
                className="text-blue-500 underline cursor-pointer ml-1"
              >
                Signup
              </Link>

            </p>
            <input
              type="submit"
              value="send an email"
              className="text-white bg-green-500 px-2 py-1 cursor-pointer rounded-lg"
            />

          </div>
        </form>
      </div>
    </>
  );
}

export default  Forgetpassword;
