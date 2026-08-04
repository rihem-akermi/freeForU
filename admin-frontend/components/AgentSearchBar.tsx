// components/AgentSearchBar.tsx
'use client'
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchAgents, AgentSearchResult } from "@/lib/api/agents";

export function AgentSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AgentSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchAgents(query)
        .then(setResults)
        .catch(console.error);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 return (
  <div ref={wrapperRef} className="relative w-full max-w-md">
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-body)]/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15Z"
        />
      </svg>

      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Rechercher un professionnel..."
        className="
          w-full
          pl-10 pr-4 py-3
          rounded-xl
          border border-[var(--color-bg-alt)]
          bg-[var(--color-card)]
          text-sm
          text-[var(--color-text-dark)]
          placeholder:text-[var(--color-text-body)]/50
          shadow-sm
          outline-none
          transition
          focus:border-[var(--color-primary)]
          focus:ring-2
          focus:ring-[var(--color-primary)]/20
        "
      />
    </div>

    {showResults && results.length > 0 && (
      <div
        className="
          absolute top-full left-0 right-0 mt-2
          bg-[var(--color-card)]
          rounded-xl
          shadow-xl
          border border-[var(--color-bg-alt)]
          overflow-hidden
          z-40
        "
      >
        {results.map((agent) => (
          <button
            key={agent.id}
            onClick={() => {
              router.push(`/agent/${agent.id}`);
              setShowResults(false);
              setQuery("");
            }}
            className="
              w-full flex items-center gap-3
              px-4 py-3
              hover:bg-[var(--color-primary)]/5
              transition
              text-left
            "
          >
            <div
              className="
                w-10 h-10
                rounded-full
                bg-[var(--color-bg-alt)]
                flex items-center justify-center
                text-sm font-semibold
                text-[var(--color-text-body)]
              "
            >
              {agent.name?.[0]?.toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--color-text-dark)]">
                {agent.name}
              </p>
              <p className="text-xs text-[var(--color-text-body)]">
                {agent.ville}
              </p>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);
}