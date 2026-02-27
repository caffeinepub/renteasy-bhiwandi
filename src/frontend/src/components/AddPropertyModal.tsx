import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { uploadImages } from "../firebase/storageService";
import { addProperty } from "../firebase/firestoreService";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { toast } from "sonner";

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

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  title: string;
  description: string;
  address: string;
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
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  address: "",
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
};

interface FormErrors {
  title?: string;
  address?: string;
  monthlyRent?: string;
  propertyType?: string;
  phone?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim() || form.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters.";
  }
  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters.";
  }
  if (
    !form.monthlyRent ||
    Number(form.monthlyRent) <= 0 ||
    isNaN(Number(form.monthlyRent))
  ) {
    errors.monthlyRent = "Monthly rent must be a positive number.";
  }
  if (!form.propertyType) {
    errors.propertyType = "Please select a property type.";
  }
  if (form.ownerPhone.trim() && !/^\d{10}$/.test(form.ownerPhone.trim())) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }
  return errors;
}

export function AddPropertyModal({ open, onClose }: AddPropertyModalProps) {
  const { currentUser } = useFirebaseAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - imageFiles.length;
    const newFiles = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...newFiles]);
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newUrls]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageRemove = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

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

    if (!currentUser) {
      toast.error("You must be logged in to add a property.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Upload images to Firebase Storage
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadProgress(10);
        imageUrls = await uploadImages(imageFiles, currentUser.uid);
        setUploadProgress(80);
      }

      // Save property to Firestore
      await addProperty({
        title: form.title.trim(),
        description: form.description.trim(),
        area: form.address.trim(),
        address: form.address.trim(),
        contactNumber: form.ownerPhone.trim(),
        rent: Number(form.monthlyRent),
        deposit: form.deposit ? Number(form.deposit) : 0,
        propertyType: form.propertyType,
        bhkType: form.bhkType.trim(),
        landmark: form.landmark.trim(),
        bestFor: form.bestFor,
        amenities: form.amenities,
        images: imageUrls,
        ownerId: currentUser.uid,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        available: true,
      });

      setUploadProgress(100);
      toast.success("Property listed successfully!");
      handleClose();
    } catch (err) {
      toast.error("Failed to create listing. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    for (const url of imagePreviews) {
      URL.revokeObjectURL(url);
    }
    setImageFiles([]);
    setImagePreviews([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add New Property
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="font-body font-medium text-sm">
              Property Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
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
              htmlFor="description"
              className="font-body font-medium text-sm"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the property..."
              rows={3}
              className="font-body resize-none"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="font-body font-medium text-sm">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => {
                setForm({ ...form, address: e.target.value });
                if (errors.address)
                  setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              placeholder="Full address in Bhiwandi"
              className={`font-body ${errors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.address && (
              <p className="text-destructive text-xs font-body mt-1">
                {errors.address}
              </p>
            )}
          </div>

          {/* Owner Phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="ownerPhone"
              className="font-body font-medium text-sm"
            >
              Owner Phone Number
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={form.ownerPhone}
              onChange={(e) => {
                setForm({ ...form, ownerPhone: e.target.value });
                if (errors.phone)
                  setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`font-body ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.phone && (
              <p className="text-destructive text-xs font-body mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Rent + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rent" className="font-body font-medium text-sm">
                Monthly Rent (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rent"
                type="number"
                min="0"
                value={form.monthlyRent}
                onChange={(e) => {
                  setForm({ ...form, monthlyRent: e.target.value });
                  if (errors.monthlyRent)
                    setErrors((prev) => ({ ...prev, monthlyRent: undefined }));
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
                htmlFor="bedrooms"
                className="font-body font-medium text-sm"
              >
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
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
                htmlFor="bathrooms"
                className="font-body font-medium text-sm"
              >
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
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
                htmlFor="deposit"
                className="font-body font-medium text-sm"
              >
                Deposit (₹)
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                placeholder="e.g. 25000"
                className="font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="bhkType"
                className="font-body font-medium text-sm"
              >
                BHK Type
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="bhkType"
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
                htmlFor="landmark"
                className="font-body font-medium text-sm"
              >
                Landmark
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="landmark"
                value={form.landmark}
                onChange={(e) =>
                  setForm({ ...form, landmark: e.target.value })
                }
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
                    id={`amenity-${amenity}`}
                    checked={form.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-body text-foreground group-hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t border-border pt-4">
            <p className="font-body font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Photos
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body">
                  {imageFiles.length}/5 photos
                </span>
              </div>

              {imageFiles.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground hover:text-primary"
                >
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm font-body font-medium">
                    Click to add photos
                  </span>
                  <span className="text-xs font-body opacity-70">
                    Up to 5 images
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {imagePreviews.map((url, idx) => (
                    <div
                      key={url}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(idx)}
                        className="absolute top-1 right-1 bg-destructive/90 text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {imageFiles.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs font-body">Add</span>
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageAdd}
              />

              {isSubmitting && uploadProgress > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-body">
                    Uploading... {uploadProgress}%
                  </p>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}
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
                  {uploadProgress < 80 ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  List Property
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
