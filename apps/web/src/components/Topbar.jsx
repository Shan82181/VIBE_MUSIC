import { LiquidButton } from "@/components/ui/shadcn-io/liquid-button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const Topbar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    navigate(`/search?q=${query}`);
  };
  // Close popup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <header className="h-[50px] md:h-[64px] flex items-center justify-between px-5 py-1 bg-black ">
      <div className="flex items-center gap-2">
        <img
          src={"/icons/VIBE_LOGO.svg"}
          alt="Vibe Logo"
          className="h-6 md:w-10 md:h-10"
        />
        <h1 className="text-2xl md:text-3xl font-bold  bg-gradient-to-br from-pink-500 to-purple-700 bg-clip-text text-transparent">
          VIBE
        </h1>
      </div>
      {/* Left side */}
      <div
        className="hidden md:flex items-center bg-zinc-700 rounded-full px-4 py-3 gap-0.5 hover:bg-zinc-600 
                hover:ring-2 hover:ring-[#c9087c] hover:ring-offset-2 hover:ring-offset-zinc-800 
                transition-all duration-200 "
      >
        <div className="relative group">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          {/* Tooltip — only visible when hovering the icon wrapper (group-hover) */}
          <span
            className={
              "absolute left-1/2 -translate-x-1/2 -bottom-9 px-2 py-1 text-[0.938rem] rounded-md " +
              "bg-zinc-800 text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible " +
              "transition-all duration-150 whitespace-nowrap pointer-events-none z-50"
            }
          >
            Search
          </span>
        </div>

        <form action="" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to play?"
            className="bg-transparent text-sm w-64 focus:outline-none placeholder:text-zinc-400"
          ></input>
        </form>
      </div>
      <button onClick={() => setOpen((p) => !p)} className="relative group md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 transition">
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span
            className={
              "absolute left-1/2 -translate-x-1/2 -bottom-9 px-2 py-1 text-[0.938rem] rounded-md " +
              "bg-zinc-800 text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible " +
              "transition-all duration-150 whitespace-nowrap pointer-events-none z-50"
            }
          >
            Search
          </span>
      </button>

      {/* Right side (User Profile) */}
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <LiquidButton>Sign In</LiquidButton>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      {open && (
        <div
          ref={popupRef}
          className="
            absolute top-[72px] left-1/2 -translate-x-1/2
            w-[90%]
            bg-zinc-800 rounded-xl
            shadow-xl p-4
            md:hidden
            z-50
          "
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default Topbar;
