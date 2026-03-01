import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    let heightInCm;

if (heightUnit === "cm") {
  heightInCm = Number(height);
} else {
  const totalInches = Number(feet) * 12 + Number(inches);
  heightInCm = totalInches * 2.54;
}

    await axios.put(
      "http://localhost:5000/api/auth/profile",
      {
        weight: Number(weight),
        height: Number(heightInCm),
        gender
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl mb-6">Complete Your Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">

        {/* Weight */}
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
          className="p-2 rounded bg-zinc-800"
        />

        {/* Height */}
        <div className="flex gap-2 items-center">
  <select
    value={heightUnit}
    onChange={(e) => setHeightUnit(e.target.value)}
    className="p-2 rounded bg-zinc-800"
  >
    <option value="cm">cm</option>
    <option value="ft">ft/in</option>
  </select>

  {heightUnit === "cm" ? (
    <input
      type="number"
      min="100"
      max="250"
      placeholder="Height (cm)"
      value={height}
      onChange={(e) => setHeight(e.target.value)}
      required
      className="p-2 rounded bg-zinc-800 w-full"
    />
  ) : (
    <div className="flex gap-2 w-full">
      <input
        type="number"
        min="3"
        max="8"
        placeholder="Feet"
        value={feet}
        onChange={(e) => setFeet(e.target.value)}
        required
        className="p-2 rounded bg-zinc-800 w-1/2"
      />
      <input
        type="number"
        min="0"
        max="11"
        placeholder="Inches"
        value={inches}
        onChange={(e) => setInches(e.target.value)}
        required
        className="p-2 rounded bg-zinc-800 w-1/2"
      />
    </div>
  )}
</div>
        {/* Gender */}
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
          className="p-2 rounded bg-zinc-800"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button
          type="submit"
          className="bg-purple-600 py-2 rounded hover:bg-purple-700 transition"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}