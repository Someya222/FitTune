import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg w-80"
      >
        <h2 className="text-white text-2xl mb-4 text-center">Register</h2>

        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-purple-600 text-white py-2 rounded">
          Sign Up
        </button>

        <p
          className="text-gray-400 text-sm mt-3 text-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}
