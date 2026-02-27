import { Link } from "@tanstack/react-router";
import { Bed, Bath, MapPin, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyListing, PropertyType } from "../backend.d";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

const TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "Apartment",
  [PropertyType.house]: "House",
  [PropertyType.room]: "Room",
  [PropertyType.pg]: "PG",
};

const TYPE_COLORS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "bg-primary/10 text-primary border-primary/20",
  [PropertyType.house]: "bg-accent/10 text-accent border-accent/20",
  [PropertyType.room]: "bg-secondary text-secondary-foreground border-border",
  [PropertyType.pg]: "bg-muted text-muted-foreground border-border",
};

interface PropertyCardProps {
  listing: PropertyListing;
  getImageUrl: (blobId: string) => string;
  staggerIndex?: number;
}

export function PropertyCard({ listing, getImageUrl, staggerIndex = 0 }: PropertyCardProps) {
  const imageUrl =
    listing.imageBlobIds.length > 0
      ? getImageUrl(listing.imageBlobIds[0])
      : PLACEHOLDER_IMAGE;

  const staggerClass = staggerIndex < 6 ? `stagger-${staggerIndex + 1}` : "";

  return (
    <Link
      to="/property/$id"
      params={{ id: listing.id.toString() }}
      className={`property-card block rounded-xl border border-border bg-card shadow-xs opacity-0 animate-fade-in-up ${staggerClass} hover:no-underline`}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={imageUrl}
          alt={listing.title}
          className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
        {/* Bottom gradient overlay for depth */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            className={`text-xs font-body font-medium border ${TYPE_COLORS[listing.propertyType]}`}
            variant="outline"
          >
            {TYPE_LABELS[listing.propertyType]}
          </Badge>
          {listing.available ? (
            <Badge className="text-xs bg-green-100 text-green-700 border-green-200 font-body font-medium" variant="outline">
              Available
            </Badge>
          ) : (
            <Badge className="text-xs bg-red-100 text-red-700 border-red-200 font-body font-medium" variant="outline">
              Rented
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-base leading-snug text-card-foreground line-clamp-1 mb-1">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1 font-body">{listing.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-primary font-semibold font-body">
            <IndianRupee className="h-4 w-4" />
            <span className="text-xl font-bold">{listing.monthlyRent.toLocaleString("en-IN")}</span>
            <span className="text-xs text-muted-foreground font-normal ml-0.5">/mo</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground text-xs font-body">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {listing.bedrooms.toString()}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {listing.bathrooms.toString()}
            </span>
          </div>
        </div>

        <span className="text-xs text-primary font-medium font-body mt-2 block">
          View Details →
        </span>
      </div>
    </Link>
  );
}
