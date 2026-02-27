import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Building2,
  IndianRupee,
  Trash2,
  MapPin,
  TrendingUp,
  Home,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPropertyModal } from "../components/AddPropertyModal";
import {
  getPropertiesByOwner,
  deleteProperty,
  type PropertyData,
} from "../firebase/firestoreService";
import { deleteImageByUrl } from "../firebase/storageService";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

export function DashboardPage() {
  const { currentUser, userProfile } = useFirebaseAuth();
  const [myProperties, setMyProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProperties = () => {
    if (!currentUser) return;
    setIsLoading(true);
    getPropertiesByOwner(currentUser.uid)
      .then(setMyProperties)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);
    getPropertiesByOwner(currentUser.uid)
      .then(setMyProperties)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const totalRent = myProperties.reduce((sum, p) => sum + (p.rent || 0), 0);
  const availableCount = myProperties.filter(
    (p) => p.available !== false
  ).length;

  const handleDelete = async (property: PropertyData) => {
    if (!property.id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This cannot be undone."
    );
    if (!confirmed) return;
    setDeletingId(property.id);
    try {
      // Delete images from Storage first
      if (property.images?.length) {
        await Promise.allSettled(
          property.images.map((url) => deleteImageByUrl(url))
        );
      }
      await deleteProperty(property.id);
      setMyProperties((prev) => prev.filter((p) => p.id !== property.id));
      toast.success("Property deleted successfully!");
    } catch {
      toast.error("Failed to delete property.");
    } finally {
      setDeletingId(null);
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
                  {userProfile?.name
                    ? `Welcome, ${userProfile.name}!`
                    : "Manage your property listings in Bhiwandi"}
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
                <p className="font-body text-xs text-muted-foreground">
                  Total Listings
                </p>
                <p className="font-display font-semibold text-2xl text-foreground">
                  {myProperties.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">
                  Available
                </p>
                <p className="font-display font-semibold text-2xl text-foreground">
                  {availableCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">
                  Total Rent Potential
                </p>
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
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : myProperties.length === 0 ? (
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
            {myProperties.map((property) => (
              <div
                key={property.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="w-full sm:w-32 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={property.images?.[0] || PLACEHOLDER_IMAGE}
                    alt={property.title}
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
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {property.bhkType && (
                        <Badge
                          variant="outline"
                          className="text-xs font-body bg-primary/10 text-primary border-primary/20"
                        >
                          {property.bhkType}
                        </Badge>
                      )}
                      {property.available !== false ? (
                        <Badge
                          className="text-xs bg-green-100 text-green-700 border-green-200 font-body"
                          variant="outline"
                        >
                          Available
                        </Badge>
                      ) : (
                        <Badge
                          className="text-xs bg-red-100 text-red-700 border-red-200 font-body"
                          variant="outline"
                        >
                          Rented
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground text-xs font-body mb-2">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">
                      {property.area || property.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-primary font-semibold text-sm font-body">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span>{property.rent?.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      /mo
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 justify-end shrink-0">
                  <Link
                    to="/property/$id"
                    params={{ id: property.id! }}
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
                    onClick={() => handleDelete(property)}
                    disabled={deletingId === property.id}
                    className="font-body text-xs h-8 px-3 text-destructive hover:text-destructive"
                  >
                    {deletingId === property.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPropertyModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          loadProperties();
        }}
      />
    </main>
  );
}
