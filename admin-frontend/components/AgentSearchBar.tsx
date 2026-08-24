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
    if (query.trim().length < 1) {
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
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50"
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
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-accent-dark focus:ring-4 focus:ring-accent/15"
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {results.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                router.push(`/agent/${agent.id}`);
                setShowResults(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent/[0.08]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {agent.name?.[0]?.toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.ville}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}