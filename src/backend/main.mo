import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  include MixinStorage();

  module PropertyListing {
    public type PropertyListing = {
      id : Nat;
      owner : Principal;
      title : Text;
      description : Text;
      address : Text;
      ownerPhone : Text;
      monthlyRent : Nat;
      propertyType : PropertyType;
      bedrooms : Nat;
      bathrooms : Nat;
      amenities : [Text];
      imageBlobIds : [Text];
      available : Bool;
      createdAt : Time.Time;
    };

    public type PropertyType = {
      #apartment;
      #house;
      #room;
      #pg;
    };

    public func compare(l1 : PropertyListing, l2 : PropertyListing) : Order.Order {
      Nat.compare(l1.id, l2.id);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let propertyListings = Map.empty<Nat, PropertyListing.PropertyListing>();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public query functions - no authentication required (accessible to all including guests)
  public query func getListingById(id : Nat) : async ?PropertyListing.PropertyListing {
    propertyListings.get(id);
  };

  public query func getAllAvailableListings() : async [PropertyListing.PropertyListing] {
    let availableListings = propertyListings.values().toArray().filter(
      func(listing) { listing.available }
    );
    availableListings.sort();
  };

  public query func searchListingsByType(propertyType : PropertyListing.PropertyType) : async [PropertyListing.PropertyListing] {
    let typeListings = propertyListings.values().toArray().filter(
      func(listing) { listing.propertyType == propertyType and listing.available }
    );
    typeListings.sort();
  };

  public query func searchListingsByMaxRent(maxRent : Nat) : async [PropertyListing.PropertyListing] {
    let filteredListings = propertyListings.values().toArray().filter(
      func(listing) { listing.monthlyRent <= maxRent and listing.available }
    );
    filteredListings.sort();
  };

  public query func searchListingsByTypeAndMaxRent(
    propertyType : PropertyListing.PropertyType,
    maxRent : Nat,
  ) : async [PropertyListing.PropertyListing] {
    let filteredListings = propertyListings.values().toArray().filter(
      func(listing) {
        listing.propertyType == propertyType and listing.monthlyRent <= maxRent and listing.available
      }
    );
    filteredListings.sort();
  };

  public query func getTotalListingsCount() : async Nat {
    let availableCount = propertyListings.values().toArray().filter(
      func(listing) { listing.available }
    ).size();
    availableCount;
  };

  // Authenticated shared functions
  public shared ({ caller }) func createPropertyListing(
    title : Text,
    description : Text,
    address : Text,
    ownerPhone : Text,
    monthlyRent : Nat,
    propertyType : PropertyListing.PropertyType,
    bedrooms : Nat,
    bathrooms : Nat,
    amenities : [Text],
    imageBlobIds : [Text],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let id = propertyListings.size() + 1;

    let listing = {
      id;
      owner = caller;
      title;
      description;
      address;
      ownerPhone;
      monthlyRent;
      propertyType;
      bedrooms;
      bathrooms;
      amenities;
      imageBlobIds;
      available = true;
      createdAt = Time.now();
    };

    propertyListings.add(id, listing);
    id;
  };

  public shared ({ caller }) func deletePropertyListing(id : Nat) : async () {
    switch (propertyListings.get(id)) {
      case (?listing) {
        if (listing.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can delete this listing");
        };
      };
      case (null) { Runtime.trap("Listing not found") };
    };

    propertyListings.remove(id);
  };
};
