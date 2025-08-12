import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { placesAutocomplete, getPlaceDetails } from "@/services/api";

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
      <Label className="mb-2 block">{label}</Label>
      <Input
        value={query !== "" ? query : displayText}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Search address, estate or landmark"}
        className="h-11"
      />
      {open && (
        <div className={cn(
          "absolute z-20 mt-1 w-full rounded-md border bg-background shadow",
          "max-h-64 overflow-auto"
        )}>
          {loading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
          )}
          {!loading && items.length > 0 && (
            items.map((it) => (
              <button
                key={it.place_id}
                type="button"
                onClick={() => handleSelect(it)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              >
                {it.description}
              </button>
            ))
          )}
          {!loading && items.length === 0 && query.length >= 3 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No suggestions</div>
          )}
        </div>
      )}
    </div>
  );
}
