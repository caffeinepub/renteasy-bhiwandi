import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Home, LogIn, Building2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyCardSkeleton } from "../components/PropertyCardSkeleton";
import { useGetAllListings, useGetTotalListingsCount } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useStorageConfig } from "../hooks/useStorageConfig";
import { PropertyType, PropertyListing } from "../backend.d";

export function BrowsePage() {
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [maxRentInput, setMaxRentInput] = useState("");
  const [minRentInput, setMinRentInput] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const { data: listings, isLoading } = useGetAllListings();
  const { data: totalCount, isLoading: totalLoading } = useGetTotalListingsCount();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { getImageUrl } = useStorageConfig();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const filteredListings = useMemo<PropertyListing[]>(() => {
    if (!listings) return [];
    let result = listings;

    if (typeFilter !== "all") {
      result = result.filter((l) => l.propertyType === typeFilter);
    }

    const maxRent = maxRentInput ? Number(maxRentInput) : null;
    if (maxRent !== null && !isNaN(maxRent)) {
      result = result.filter((l) => Number(l.monthlyRent) <= maxRent);
    }

    const minRent = minRentInput ? Number(minRentInput) : null;
    if (minRent !== null && !isNaN(minRent)) {
      result = result.filter((l) => Number(l.monthlyRent) >= minRent);
    }

    if (areaFilter.trim()) {
      const area = areaFilter.trim().toLowerCase();
      result = result.filter((l) => l.address.toLowerCase().includes(area));
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      );
    }

    return result;
  }, [listings, typeFilter, maxRentInput, minRentInput, areaFilter, searchText]);

  const handleClearFilters = () => {
    setTypeFilter("all");
    setMaxRentInput("");
    setMinRentInput("");
    setAreaFilter("");
    setSearchText("");
  };

  const hasActiveFilters = typeFilter !== "all" || maxRentInput || minRentInput || areaFilter || searchText;

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-white/8 blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4">
              Find Your Perfect<br />
              <span className="text-amber-100">Rental in Bhiwandi</span>
            </h1>
            <p className="font-body text-white/80 text-lg mb-4">
              Discover apartments, houses, rooms, and PGs at the best prices.
            </p>

            {/* Property count badge */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20">
                <Building2 className="h-3.5 w-3.5 text-amber-200" />
                {totalLoading ? (
                  <Skeleton className="h-4 w-36 bg-white/20" />
                ) : (
                  <span className="font-body text-sm text-white/90 font-medium">
                    {totalCount !== undefined ? Number(totalCount).toLocaleString("en-IN") : "—"} properties available in Bhiwandi
                  </span>
                )}
              </div>
              <span className="trust-badge">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Listings
              </span>
              <span className="trust-badge">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No Brokerage
              </span>
              <span className="trust-badge">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Instant Contact
              </span>
            </div>

            {/* Search bar — unified pill container */}
            <div className="rounded-2xl bg-white/95 p-1.5 flex gap-2 shadow-xl animate-fade-in-up stagger-1">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by title or address..."
                  className="pl-10 border-0 bg-transparent text-foreground placeholder:text-muted-foreground font-body h-11 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="button"
                className="hero-gradient text-white border-0 hover:opacity-90 h-11 px-5 font-body font-medium rounded-xl"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative wave transition */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[2rem]" />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Login CTA for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center shrink-0">
                <Home className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-body font-medium text-foreground text-sm">
                  Login to contact property owners
                </p>
                <p className="font-body text-muted-foreground text-xs">
                  Create an account to manage your rentals or list your property.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="hero-gradient text-white border-0 hover:opacity-90 shrink-0 font-body font-medium"
            >
              {isLoggingIn ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Login
                </>
              )}
            </Button>
          </div>
        )}

        {/* Filter Bar — inside a card */}
        <div className="filter-card mb-8 animate-fade-in-up stagger-2">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-body font-medium">Filters:</span>
            </div>

            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as PropertyType | "all")}
            >
              <SelectTrigger className="w-44 font-body text-sm h-9">
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={PropertyType.apartment}>Apartment</SelectItem>
                <SelectItem value={PropertyType.house}>House</SelectItem>
                <SelectItem value={PropertyType.room}>Room</SelectItem>
                <SelectItem value={PropertyType.pg}>PG</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              placeholder="Filter by area, e.g. Anjur"
              className="w-48 h-9 font-body text-sm"
            />

            <div className="flex items-center gap-1.5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-body">₹</span>
                <Input
                  type="number"
                  value={minRentInput}
                  onChange={(e) => setMinRentInput(e.target.value)}
                  placeholder="Min"
                  className="pl-7 w-28 h-9 font-body text-sm"
                />
              </div>
              <span className="text-muted-foreground text-xs font-body">to</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-body">₹</span>
                <Input
                  type="number"
                  value={maxRentInput}
                  onChange={(e) => setMaxRentInput(e.target.value)}
                  placeholder="Max"
                  className="pl-7 w-28 h-9 font-body text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground font-body text-sm h-9"
              >
                Clear filters
              </Button>
            )}

            <span className="sm:ml-auto text-sm text-muted-foreground font-body">
              {isLoading ? "Loading..." : `${filteredListings.length} listing${filteredListings.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"] as const).map((k) => (
              <PropertyCardSkeleton key={k} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <Home className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No properties found
            </h3>
            <p className="font-body text-muted-foreground max-w-sm">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results."
                : "No listings are available right now. Check back soon!"}
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                className="mt-5 font-body"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing, idx) => (
              <PropertyCard
                key={listing.id.toString()}
                listing={listing}
                getImageUrl={getImageUrl}
                staggerIndex={idx % 6}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
