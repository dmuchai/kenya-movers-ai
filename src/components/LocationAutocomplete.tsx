import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { placesAutocomplete, getPlaceDetails } from "@/services/api";
import { LoadingSpinner, PulsingDot } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search } from "lucide-react";

export type LocationValue = {
  description: string;
  place_id: string;
  formatted_address: string;
  location: { lat: number; lng: number };
};

interface Props {
  label: string;
  placeholder?: string;
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
}

export default function LocationAutocomplete({ label, placeholder, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<{ description: string; place_id: string }>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Debounce query
  useEffect(() => {
    if (!query || query.length < 3) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    // Open dropdown immediately so users see loading state
    setOpen(true);
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await placesAutocomplete(query);
        setItems(res);
        setOpen(true);
      } catch (e) {
        console.warn("places autocomplete failed", e);
        setItems([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const displayText = value?.formatted_address || value?.description || "";

  const handleSelect = async (it: { description: string; place_id: string }) => {
    setOpen(false);
    setQuery("");
    try {
      const details = await getPlaceDetails(it.place_id);
      onChange({
        description: details.description,
        place_id: details.place_id,
        formatted_address: details.formatted_address,
        location: details.location,
      });
    } catch (e) {
      console.warn("place details failed", e);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={query !== "" ? query : displayText}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || "Search address, estate or landmark"}
          className="h-11 pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <LoadingSpinner size="sm" className="text-muted-foreground" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {open && (
        <div className={cn(
          "absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg",
          "max-h-64 overflow-auto animate-in slide-in-from-top-2 duration-200"
        )}>
          {loading && (
            <div className="px-3 py-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PulsingDot size="sm" />
                Searching locations...
              </div>
              {/* Loading skeleton */}
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          )}
          {!loading && items.length > 0 && (
            items.map((it, index) => (
              <button
                key={it.place_id}
                type="button"
                onClick={() => handleSelect(it)}
                className="w-full text-left px-3 py-3 text-sm hover:bg-muted transition-colors duration-150 flex items-center gap-2 animate-in slide-in-from-left-1 duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{it.description}</span>
              </button>
            ))
          )}
          {!loading && items.length === 0 && query.length >= 3 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Search className="w-4 h-4" />
                No locations found
              </div>
              <p className="text-xs">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
