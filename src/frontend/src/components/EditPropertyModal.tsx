import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type PropertyData,
  updateProperty,
} from "../firebase/firestoreService";

const AMENITY_OPTIONS = [
  "Parking",
  "WiFi",
  "AC",
  "Water",
  "Electricity",
  "Security",
  "Lift",
  "Gym",
  "Swimming Pool",
];

interface EditPropertyModalProps {
  open: boolean;
  property: PropertyData;
  onClose: () => void;
}

interface FormState {
  title: string;
  description: string;
  area: string;
  ownerPhone: string;
  monthlyRent: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  deposit: string;
  bhkType: string;
  landmark: string;
  bestFor: string;
  imageUrl: string;
}

interface FormErrors {
  title?: string;
  area?: string;
  monthlyRent?: string;
  deposit?: string;
  contactNumber?: string;
  imageUrl?: string;
  propertyType?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim() || form.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters.";
  }

  if (!form.area.trim() || form.area.trim().length < 3) {
    errors.area = "Area is required.";
  }

  if (
    !form.monthlyRent ||
    Number.isNaN(Number(form.monthlyRent)) ||
    Number(form.monthlyRent) <= 0
  ) {
    errors.monthlyRent = "Rent must be a positive number.";
  }

  if (
    form.deposit.trim() &&
    (Number.isNaN(Number(form.deposit)) || Number(form.deposit) < 0)
  ) {
    errors.deposit = "Deposit must be 0 or more.";
  }

  if (!form.ownerPhone.trim() || !/^\d{10}$/.test(form.ownerPhone.trim())) {
    errors.contactNumber = "Contact number is required (10 digits).";
  }

  if (form.imageUrl.trim() && !/^https?:\/\//i.test(form.imageUrl.trim())) {
    errors.imageUrl = "Enter a valid URL (starting with http:// or https://).";
  }

  return errors;
}

export function EditPropertyModal({
  open,
  property,
  onClose,
}: EditPropertyModalProps) {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    area: "",
    ownerPhone: "",
    monthlyRent: "",
    propertyType: "",
    bedrooms: "1",
    bathrooms: "1",
    amenities: [],
    deposit: "",
    bhkType: "",
    landmark: "",
    bestFor: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form whenever property changes
  useEffect(() => {
    if (property) {
      setForm({
        title: property.title ?? "",
        description: property.description ?? "",
        area: property.area ?? property.address ?? "",
        ownerPhone: property.contactNumber ?? "",
        monthlyRent: property.rent != null ? String(property.rent) : "",
        propertyType: property.propertyType ?? "",
        bedrooms: property.bedrooms != null ? String(property.bedrooms) : "1",
        bathrooms:
          property.bathrooms != null ? String(property.bathrooms) : "1",
        amenities: property.amenities ?? [],
        deposit: property.deposit != null ? String(property.deposit) : "",
        bhkType: property.bhkType ?? "",
        landmark: property.landmark ?? "",
        bestFor: property.bestFor ?? "",
        imageUrl: property.imageUrl ?? "",
      });
      setErrors({});
    }
  }, [property]);

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (!property.id) {
      toast.error("Cannot update property: missing ID.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProperty(property.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        area: form.area.trim(),
        address: form.area.trim(),
        contactNumber: form.ownerPhone.trim(),
        rent: Number(form.monthlyRent),
        deposit: form.deposit ? Number(form.deposit) : 0,
        propertyType: form.propertyType,
        bhkType: form.bhkType.trim(),
        landmark: form.landmark.trim(),
        bestFor: form.bestFor,
        amenities: form.amenities,
        imageUrl: form.imageUrl.trim(),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      });
      toast.success("Property updated successfully!");
      onClose();
    } catch (err) {
      toast.error("Failed to update listing. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Edit Property
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-title"
              className="font-body font-medium text-sm"
            >
              Property Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Spacious 2BHK near Highway"
              className={`font-body ${errors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.title && (
              <p className="text-destructive text-xs font-body mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-description"
              className="font-body font-medium text-sm"
            >
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the property..."
              rows={3}
              className="font-body resize-none"
            />
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-area"
              className="font-body font-medium text-sm"
            >
              Area <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-area"
              value={form.area}
              onChange={(e) => {
                setForm({ ...form, area: e.target.value });
                if (errors.area)
                  setErrors((prev) => ({ ...prev, area: undefined }));
              }}
              placeholder="Area or locality in Bhiwandi"
              className={`font-body ${errors.area ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.area && (
              <p className="text-destructive text-xs font-body mt-1">
                {errors.area}
              </p>
            )}
          </div>

          {/* Owner Phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-ownerPhone"
              className="font-body font-medium text-sm"
            >
              Owner Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-ownerPhone"
              type="tel"
              value={form.ownerPhone}
              onChange={(e) => {
                setForm({ ...form, ownerPhone: e.target.value });
                if (errors.contactNumber)
                  setErrors((prev) => ({
                    ...prev,
                    contactNumber: undefined,
                  }));
              }}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`font-body ${errors.contactNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.contactNumber && (
              <p className="text-destructive text-xs font-body mt-1">
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* Rent + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-rent"
                className="font-body font-medium text-sm"
              >
                Monthly Rent (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-rent"
                type="number"
                min="0"
                value={form.monthlyRent}
                onChange={(e) => {
                  setForm({ ...form, monthlyRent: e.target.value });
                  if (errors.monthlyRent)
                    setErrors((prev) => ({
                      ...prev,
                      monthlyRent: undefined,
                    }));
                }}
                placeholder="e.g. 8000"
                className={`font-body ${errors.monthlyRent ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.monthlyRent && (
                <p className="text-destructive text-xs font-body mt-1">
                  {errors.monthlyRent}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="font-body font-medium text-sm">
                Property Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.propertyType}
                onValueChange={(v) => {
                  setForm({ ...form, propertyType: v });
                  if (errors.propertyType)
                    setErrors((prev) => ({
                      ...prev,
                      propertyType: undefined,
                    }));
                }}
              >
                <SelectTrigger
                  className={`font-body ${errors.propertyType ? "border-destructive" : ""}`}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="pg">PG</SelectItem>
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-destructive text-xs font-body mt-1">
                  {errors.propertyType}
                </p>
              )}
            </div>
          </div>

          {/* Beds + Baths row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-bedrooms"
                className="font-body font-medium text-sm"
              >
                Bedrooms
              </Label>
              <Input
                id="edit-bedrooms"
                type="number"
                min="0"
                max="20"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-bathrooms"
                className="font-body font-medium text-sm"
              >
                Bathrooms
              </Label>
              <Input
                id="edit-bathrooms"
                type="number"
                min="0"
                max="20"
                value={form.bathrooms}
                onChange={(e) =>
                  setForm({ ...form, bathrooms: e.target.value })
                }
                className="font-body"
              />
            </div>
          </div>

          {/* Deposit + BHK Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-deposit"
                className="font-body font-medium text-sm"
              >
                Deposit (₹)
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="edit-deposit"
                type="number"
                min="0"
                value={form.deposit}
                onChange={(e) => {
                  setForm({ ...form, deposit: e.target.value });
                  if (errors.deposit)
                    setErrors((prev) => ({ ...prev, deposit: undefined }));
                }}
                placeholder="e.g. 25000"
                className={`font-body ${errors.deposit ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.deposit && (
                <p className="text-destructive text-xs font-body mt-1">
                  {errors.deposit}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-bhkType"
                className="font-body font-medium text-sm"
              >
                BHK Type
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="edit-bhkType"
                value={form.bhkType}
                onChange={(e) => setForm({ ...form, bhkType: e.target.value })}
                placeholder="e.g. 1BHK, 2BHK, 3BHK, Studio"
                className="font-body"
              />
            </div>
          </div>

          {/* Landmark + Best For row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-landmark"
                className="font-body font-medium text-sm"
              >
                Landmark
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="edit-landmark"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                placeholder="Nearby landmark"
                className="font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body font-medium text-sm">
                Best For
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Select
                value={form.bestFor}
                onValueChange={(v) => setForm({ ...form, bestFor: v })}
              >
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Select tenant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Families">Families</SelectItem>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Working Professionals">
                    Working Professionals
                  </SelectItem>
                  <SelectItem value="Bachelors">Bachelors</SelectItem>
                  <SelectItem value="Any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-imageUrl"
              className="font-body font-medium text-sm"
            >
              Property Image URL
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="edit-imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => {
                setForm({ ...form, imageUrl: e.target.value });
                if (errors.imageUrl)
                  setErrors((prev) => ({ ...prev, imageUrl: undefined }));
              }}
              placeholder="https://example.com/property-image.jpg"
              className={`font-body ${errors.imageUrl ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.imageUrl && (
              <p className="text-destructive text-xs font-body mt-1">
                {errors.imageUrl}
              </p>
            )}
          </div>

          {/* Amenities */}
          <div className="border-t border-border pt-4">
            <p className="font-body font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Amenities
            </p>
            <div className="grid grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <Checkbox
                    id={`edit-amenity-${amenity}`}
                    checked={form.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`edit-amenity-${amenity}`}
                    className="text-sm font-body text-foreground group-hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-body hero-gradient text-white border-0 hover:opacity-90 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
