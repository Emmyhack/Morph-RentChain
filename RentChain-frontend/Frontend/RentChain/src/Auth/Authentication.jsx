import { useState } from "react";
import { CiMail, CiUser } from "react-icons/ci";
import { IoLockClosedOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

export default function Authentication() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="w-full h-full max-h-screen py-10">
      <div className="max-w-6xl p-10 m-auto rounded-xl">
        <div className="m-auto cursor-pointer w-fit">
          <img src="/logo.png" alt="logo image" loading="lazy" className="w-[20rem] h-fit cursor-pointer" />
        </div>
        <p className="text-4xl font-medium text-center normal-case text-secondary">Welcome to the decentralized rental platform</p>

        <div className="w-full p-10 rounded-xl shadow-[1px_1px_10px_rgba(0,0,0,0.1)] bg-white max-w-8xl m-auto mt-10">
          <h3 className="text-4xl font-semibold text-center my-7">Access your account</h3>

          <div className="flex items-center justify-center p-2 px-3 bg-gray-300 gap-x-10 rounded-xl">
            <div
              className={`w-full text-3xl font-medium text-center h-[4.5rem] text-secondary flex items-center justify-center rounded-xl cursor-pointer ${
                activeTab === "login" ? " bg-white text-black" : ""
              }`}
              onClick={() => setActiveTab("login")}
            >
              login
            </div>
            <div
              className={`w-full text-3xl font-medium text-center rounded-xl cursor-pointer text-secondary h-[4.5rem] flex items-center justify-center ${
                activeTab === "signup" ? " bg-white text-black" : ""
              }`}
              onClick={() => setActiveTab("signup")}
            >
              sign up
            </div>
          </div>

          {/*  Login */}
          {activeTab === "login" && (
            <form className="mt-12 space-y-8">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[1.7rem] font-medium">
                  Email
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    name="text"
                    className="w-full h-[5.5rem] text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                    placeholder="enter your email"
                  />
                  <CiMail className="absolute text-5xl top-5 left-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-[1.7rem] font-medium">
                  password
                </label>
                <div className="relative w-full">
                  <input
                    type="password"
                    name="password"
                    className="w-full h-[5.5rem] text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                    placeholder="enter your password"
                  />
                  <IoLockClosedOutline className="absolute text-5xl top-4 left-4" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <input type="checkbox" name="remember" className="w-8 h-8 cursor-pointer accent-primary" />
                  <label htmlFor="remember" className="text-[1.7rem] font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-[1.7rem] font-medium text-primary cursor-pointer hover:underline">Forgot password?</div>
              </div>

              <Link to="/about">
                <button
                  type="submit"
                  className="w-full h-[5.5rem] capitalize mt-8 text-[1.7rem] font-semibold text-white bg-primary rounded-xl hover:bg-blue-600 transition-colors duration-200"
                >
                  sign in
                </button>
              </Link>

              <p className="text-2xl font-medium text-center normal-case text-secondary">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}

          {/* Sign up */}
          {activeTab === "signup" && (
            <form className="mt-12 space-y-8">
              <div className="flex items-center w-full gap-x-5">
                <div className="w-full space-y-2">
                  <label htmlFor="name" className="text-[1.7rem] font-medium">
                    First name
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="text"
                      className="w-full h-[5.5rem] text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                      placeholder="first name"
                    />
                    <CiUser className="absolute text-5xl top-5 left-4" />
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <label htmlFor="name" className="text-[1.7rem] font-medium">
                    last name
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="text"
                      className="w-full h-[5.5rem] text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                      placeholder="last name"
                    />
                    <CiUser className="absolute text-5xl top-5 left-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[1.7rem] font-medium">
                  Email
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    name="text"
                    className="w-full h-[5.5rem] text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                    placeholder="enter your email"
                  />
                  <CiMail className="absolute text-5xl top-5 left-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[1.7rem] font-medium">
                  password
                </label>
                <div className="relative w-full">
                  <input
                    type="password"
                    name="password"
                    className="w-full h-[5.5rem] normal-case text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                    placeholder="Create a password "
                  />
                  <IoLockClosedOutline className="absolute text-5xl top-4 left-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[1.7rem] font-medium">
                  confirm password
                </label>
                <div className="relative w-full">
                  <input
                    type="password"
                    name="password"
                    className="w-full h-[5.5rem] normal-case text-[1.7rem] pl-20 bg-transparent border border-gray-300 focus:border-gray-700 rounded-xl placeholder:text-secondary"
                    placeholder="Confirm your password "
                  />
                  <IoLockClosedOutline className="absolute text-5xl top-4 left-4" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <input type="checkbox" name="remember" className="w-8 h-8 cursor-pointer accent-primary" />
                  <p className="text-[1.7rem] font-medium normal-case">
                    I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>
                  </p>
                </div>
              </div>

              <Link to="/about">
                <button
                  type="submit"
                  className="w-full h-[5.5rem] mt-8 capitalize text-[1.7rem] font-semibold text-white bg-primary rounded-xl hover:bg-blue-600 transition-colors duration-200"
                >
                  create account
                </button>
              </Link>

              <p className="text-2xl font-medium text-center normal-case text-secondary">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
