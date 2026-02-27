import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Building2,
  Bed,
  Bath,
  IndianRupee,
  Pencil,
  Trash2,
  MapPin,
  TrendingUp,
  Home,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPropertyModal } from "../components/AddPropertyModal";
import { useGetAllListings, useDeleteListingMutation } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useStorageConfig } from "../hooks/useStorageConfig";
import { PropertyType } from "../backend.d";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

const TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "Apartment",
  [PropertyType.house]: "House",
  [PropertyType.room]: "Room",
  [PropertyType.pg]: "PG",
};

export function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: allListings, isLoading } = useGetAllListings();
  const { getImageUrl } = useStorageConfig();
  const deleteMutation = useDeleteListingMutation();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const ownerPrincipal = identity?.getPrincipal().toString();

  const myListings = allListings?.filter(
    (l) => l.owner.toString() === ownerPrincipal
  ) ?? [];

  const availableCount = myListings.filter((l) => l.available).length;
  const totalRent = myListings.reduce((sum, l) => sum + Number(l.monthlyRent), 0);

  const handleEdit = () => {
    toast.info("Edit feature coming soon!");
  };

  const handleDelete = async (listingId: bigint, ownerStr: string) => {
    if (ownerStr !== ownerPrincipal) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(listingId);
      toast.success("Property deleted successfully!");
    } catch {
      toast.error("Failed to delete property.");
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 mb-8 animate-fade-in-up border border-primary/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground mb-0.5">
                  Owner Dashboard
                </h1>
                <p className="font-body text-muted-foreground text-sm">
                  Manage your property listings in Bhiwandi
                </p>
              </div>
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="hero-gradient text-white border-0 hover:opacity-90 font-body font-medium shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up stagger-1">
          <div className="card-elevated p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Total Listings</p>
                <p className="font-display font-semibold text-2xl text-foreground">{myListings.length}</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Available</p>
                <p className="font-display font-semibold text-2xl text-foreground">{availableCount}</p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Total Rent Potential</p>
                <p className="font-display font-semibold text-2xl text-foreground">
                  ₹{totalRent.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings section */}
        <h2 className="font-display text-lg font-semibold mb-4 text-foreground animate-fade-in-up stagger-2">
          Your Properties
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {(["a", "b", "c"] as const).map((k) => (
              <div key={k} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <Skeleton className="w-24 h-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No listings yet
            </h3>
            <p className="font-body text-muted-foreground mb-6 max-w-sm">
              Add your first property to start attracting renters in Bhiwandi.
            </p>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="hero-gradient text-white border-0 hover:opacity-90 font-body font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up stagger-3">
            {myListings.map((listing) => {
              const imageUrl =
                listing.imageBlobIds.length > 0
                  ? getImageUrl(listing.imageBlobIds[0])
                  : PLACEHOLDER_IMAGE;

              return (
                <div
                  key={listing.id.toString()}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="w-full sm:w-32 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="font-display font-semibold text-foreground text-sm leading-snug line-clamp-1 flex-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs font-body bg-primary/10 text-primary border-primary/20"
                        >
                          {TYPE_LABELS[listing.propertyType]}
                        </Badge>
                        {listing.available ? (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200 font-body" variant="outline">
                            Available
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-red-100 text-red-700 border-red-200 font-body" variant="outline">
                            Rented
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-xs font-body mb-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{listing.address}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-0.5 text-primary font-semibold text-sm font-body">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{listing.monthlyRent.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground font-normal">/mo</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <Bed className="h-3.5 w-3.5" /> {listing.bedrooms.toString()} beds
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <Bath className="h-3.5 w-3.5" /> {listing.bathrooms.toString()} baths
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 justify-end shrink-0">
                    <Link
                      to="/property/$id"
                      params={{ id: listing.id.toString() }}
                      className="inline-flex"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-body text-xs h-8 px-3"
                      >
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="font-body text-xs h-8 px-3"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    {listing.owner.toString() === ownerPrincipal && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(listing.id, listing.owner.toString())}
                        disabled={deleteMutation.isPending}
                        className="font-body text-xs h-8 px-3 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddPropertyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </main>
  );
}
