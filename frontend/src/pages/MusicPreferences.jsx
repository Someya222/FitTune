import { useState, useEffect } from "react";
import axios from "axios";

const GENRES = ["Phonk", "EDM", "Hip-hop", "Bollywood", "Rock", "Pop", "Electronic", "Jazz"];
const LANGUAGES = ["Hindi", "English", "Punjabi", "Spanish", "Korean"];
const ENERGY_LEVELS = ["Light", "Medium", "High", "Beast Mode"];
const VOCAL_PREFS = ["With vocals", "Instrumental", "Both"];

export default function MusicPreferences() {
  const [prefs, setPrefs] = useState({
    genres: [],
    languages: [],
    energyPreference: "Medium",
    vocalPreference: "Both",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.musicPreferences) {
          setPrefs(res.data.musicPreferences);
        }
      } catch (err) {
        console.error("Error fetching music preferences:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggleGenre = (genre) => {
    setPrefs((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleToggleLanguage = (lang) => {
    setPrefs((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/auth/profile",
        { musicPreferences: prefs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Preferences saved! ✨");
    } catch (err) {
      console.error("Error saving preferences:", err);
      alert("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading preferences...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-white">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Music Preferences
        </h1>
        <p className="text-gray-400 mt-2">Tailor your workout soundtrack to your taste.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Favorite Genres */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Favorite Genres</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => handleToggleGenre(g)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  prefs.genres.includes(g)
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-[#1a1a3a] text-gray-400 hover:bg-[#2a2a5a]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => handleToggleLanguage(l)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  prefs.languages.includes(l)
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-[#1a1a3a] text-gray-400 hover:bg-[#2a2a5a]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Default Energy</h2>
          <div className="grid grid-cols-2 gap-2">
            {ENERGY_LEVELS.map((e) => (
              <button
                key={e}
                onClick={() => setPrefs({ ...prefs, energyPreference: e })}
                className={`px-4 py-3 rounded-xl text-sm transition-all border-2 ${
                  prefs.energyPreference === e
                    ? "border-purple-500 bg-purple-500/10 text-white"
                    : "border-transparent bg-[#1a1a3a] text-gray-400 hover:bg-[#2a2a5a]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Vocal Pref */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vocal Preference</h2>
          <div className="grid grid-cols-3 gap-2">
            {VOCAL_PREFS.map((v) => (
              <button
                key={v}
                onClick={() => setPrefs({ ...prefs, vocalPreference: v })}
                className={`px-3 py-3 rounded-xl text-xs transition-all border-2 ${
                  prefs.vocalPreference === v
                    ? "border-pink-500 bg-pink-500/10 text-white"
                    : "border-transparent bg-[#1a1a3a] text-gray-400 hover:bg-[#2a2a5a]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-green-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
