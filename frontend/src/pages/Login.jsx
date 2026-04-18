import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:9000/api/auth/login",
        data,
        {
            withCredentials: true
        }
      );
      console.log(res.data);
      if(res) {
        console.log("login ho gaya ")
      }
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10"
      >
        <h2 className="text-3xl font-semibold text-center text-white mb-8">
          Welcome Back 👋
        </h2>

        <div className="space-y-5 flex flex-col  gap-">
          <input
            placeholder="Email"
            {...register("email")}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full p-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button className="w-full mt-7 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition">
          Login
        </button>

        <p className="mt-6 text-center text-gray-300">
          Don't have account?{" "}
          <Link to="/register" className="text-purple-400 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
