import { useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Calendar,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetListingById } from "../hooks/useQueries";
import { useStorageConfig } from "../hooks/useStorageConfig";
import { PropertyType } from "../backend.d";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

const TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "Apartment",
  [PropertyType.house]: "House",
  [PropertyType.room]: "Room",
  [PropertyType.pg]: "PG",
};

export function PropertyDetailPage() {
  const { id } = useParams({ from: "/property/$id" });
  const listingId = BigInt(id);
  const { data: listing, isLoading } = useGetListingById(listingId);
  const { getImageUrl } = useStorageConfig();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const imageUrls =
    listing && listing.imageBlobIds.length > 0
      ? listing.imageBlobIds.map((blobId) => getImageUrl(blobId))
      : [PLACEHOLDER_IMAGE];

  const mainImageUrl = imageUrls[activeImageIdx] ?? PLACEHOLDER_IMAGE;

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-video rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!listing) {
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

  const createdDate = new Date(Number(listing.createdAt / BigInt(1_000_000)));

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video mb-3">
              <img
                src={mainImageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
              <div className="absolute top-3 right-3">
                {listing.available ? (
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

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {imageUrls.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeImageIdx
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="font-display text-2xl font-semibold text-foreground leading-snug">
                  {listing.title}
                </h1>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs font-body font-medium bg-primary/10 text-primary border-primary/20"
                >
                  {TYPE_LABELS[listing.propertyType]}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="font-body text-sm">{listing.address}</span>
              </div>

              <div className="flex items-center gap-1 text-primary font-semibold">
                <IndianRupee className="h-5 w-5" />
                <span className="font-display text-3xl">{listing.monthlyRent.toLocaleString("en-IN")}</span>
                <span className="text-sm text-muted-foreground font-body font-normal ml-1">/ month</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Bedrooms", value: listing.bedrooms.toString(), icon: <Bed className="h-4 w-4" /> },
                { label: "Bathrooms", value: listing.bathrooms.toString(), icon: <Bath className="h-4 w-4" /> },
                { label: "Type", value: TYPE_LABELS[listing.propertyType], icon: null },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="p-3 rounded-xl bg-secondary border border-border text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                    {icon}
                    <span className="text-xs font-body">{label}</span>
                  </div>
                  <p className="font-display font-semibold text-foreground text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2">Description</h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
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

            {/* Listed date */}
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-body pt-2 border-t border-border">
              <Calendar className="h-3.5 w-3.5" />
              Listed on {createdDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </div>

            {/* Contact Owner */}
            {listing.ownerPhone && listing.ownerPhone.trim() !== "" && (
              <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 mt-1">
                <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  Contact Owner
                </h3>
                <div className="flex flex-col gap-2">
                  <a
                    href={"tel:" + listing.ownerPhone}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white font-body font-medium text-sm py-2.5 px-4 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Owner
                  </a>
                  <a
                    href={"https://wa.me/91" + listing.ownerPhone.replace(/\D/g, "")}
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
