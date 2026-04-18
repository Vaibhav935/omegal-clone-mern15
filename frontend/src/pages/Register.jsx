import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const res = await axios.post(
        "http://localhost:9000/api/auth/register",
        data,
        {
          withCredentials: true,
        },
      );
      console.log(res.data);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-96 px-6 py-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-center text-white mb-4">
          Create Account 🚀
        </h2>

        <input
          placeholder="Username"
          {...register("username")}
          className="w-full p-2 mb-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none"
        />

        <input
          placeholder="Email"
          {...register("email")}
          className="w-full p-2 mb-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full p-2 mb-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none"
        />

        <button className="w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium">
          Register
        </button>

        <p className="mt-2 text-sm text-center text-gray-300">
          Already have account?{" "}
          <Link to="/" className="text-purple-400 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
