import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type PropertyData,
  getPropertyById,
} from "../firebase/firestoreService";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

export function PropertyDetailPage() {
  const { id } = useParams({ from: "/main/property/$id" });
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPropertyById(id)
      .then(setProperty)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const mainImageUrl = property?.imageUrl || PLACEHOLDER_IMAGE;

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!property) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <XCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Property not found
        </h2>
        <p className="font-body text-muted-foreground mb-6">
          This listing may have been removed or doesn't exist.
        </p>
        <Link to="/">
          <Button variant="outline" className="font-body">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video mb-3">
              <img
                src={mainImageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
              <div className="absolute top-3 right-3">
                {property.available !== false ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 font-body font-medium text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 font-body font-medium text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rented
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="font-display text-2xl font-semibold text-foreground leading-snug">
                  {property.title}
                </h1>
                {property.bhkType && (
                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs font-body font-medium bg-primary/10 text-primary border-primary/20"
                  >
                    {property.bhkType}
                  </Badge>
                )}
              </div>

              {(property.area || property.address) && (
                <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="font-body text-sm">
                    {property.area || property.address}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 text-primary font-semibold">
                <IndianRupee className="h-5 w-5" />
                <span className="font-display text-3xl">
                  {property.rent?.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-muted-foreground font-body font-normal ml-1">
                  / month
                </span>
              </div>
            </div>

            {/* Extended property info */}
            {(property.deposit ||
              property.bhkType ||
              property.landmark ||
              property.bestFor) && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.deposit ? (
                    <div className="p-3 rounded-xl bg-secondary border border-border">
                      <p className="text-xs text-muted-foreground font-body mb-1">
                        Security Deposit
                      </p>
                      <p className="font-display font-semibold text-foreground text-sm flex items-center gap-0.5">
                        <IndianRupee className="h-3.5 w-3.5 text-primary" />
                        {property.deposit.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ) : null}
                  {property.bhkType ? (
                    <div className="p-3 rounded-xl bg-secondary border border-border">
                      <p className="text-xs text-muted-foreground font-body mb-1">
                        BHK Type
                      </p>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {property.bhkType}
                      </p>
                    </div>
                  ) : null}
                  {property.landmark ? (
                    <div className="p-3 rounded-xl bg-secondary border border-border">
                      <p className="text-xs text-muted-foreground font-body mb-1">
                        Nearby Landmark
                      </p>
                      <p className="font-display font-semibold text-foreground text-sm flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        {property.landmark}
                      </p>
                    </div>
                  ) : null}
                  {property.bestFor ? (
                    <div className="p-3 rounded-xl bg-secondary border border-border">
                      <p className="text-xs text-muted-foreground font-body mb-1">
                        Best For
                      </p>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {property.bestFor}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Description
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm font-body text-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Owner */}
            {property.contactNumber && property.contactNumber.trim() !== "" && (
              <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 mt-1">
                <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  Contact Owner
                </h3>
                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:${property.contactNumber}`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white font-body font-medium text-sm py-2.5 px-4 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Owner
                  </a>
                  <a
                    href={`https://wa.me/91${property.contactNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#25D366] hover:bg-[#20b958] text-white font-body font-medium text-sm py-2.5 px-4 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
