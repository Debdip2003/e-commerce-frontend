import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { getUserProfile, getUserById, updateUserProfile } from "../services/userService";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Step 1: Get user ID from profile endpoint
      const userId = await getUserProfile();

      if (!userId) {
        toast.error("Unable to identify user");
        setIsLoading(false);
        return;
      }

      // Step 2: Fetch full user details using the user ID
      const fullUserDetails = await getUserById(userId);
      setUserProfile(fullUserDetails);
      setEditData(fullUserDetails);
    } catch (error) {
      toast.error("Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("address.")) {
      const fieldName = name.split(".")[1];
      setEditData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [fieldName]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      
      const updatePayload = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNumber: editData.phoneNumber,
        address: {
          street: editData.address?.street || "",
          city: editData.address?.city || "",
          state: editData.address?.state || "",
          zipcode: editData.address?.zipcode || "",
          country: editData.address?.country || ""
        }
      };
      
      await updateUserProfile(updatePayload);
      toast.success("Profile updated successfully");
      setUserProfile(editData);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData(userProfile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="border-t pt-16 min-h-[80vh] flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="border-t pt-16 min-h-[80vh]">
        <div className="text-2xl mb-8">
          <Title text1={"MY"} text2={"PROFILE"} />
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Unable to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16 pb-16">
      <div className="flex justify-between items-center mb-8">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"PROFILE"} />
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        // Edit Mode
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information Edit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Personal Information</h2>
            
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="text-sm text-gray-600 font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editData.firstName || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editData.lastName || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <input
                  type="email"
                  disabled
                  value={editData.email || ""}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={editData.phoneNumber || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Address Information Edit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Address Information</h2>
            
            <div className="space-y-4">
              {/* Street */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={editData.address?.street || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-sm text-gray-600 font-medium">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={editData.address?.city || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>

              {/* State */}
              <div>
                <label className="text-sm text-gray-600 font-medium">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={editData.address?.state || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>

              {/* Zipcode */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Zipcode</label>
                <input
                  type="text"
                  name="address.zipcode"
                  value={editData.address?.zipcode || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={editData.address?.country || ""}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded py-2 px-3 mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // View Mode
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Personal Information</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">Full Name</label>
                  <p className="text-gray-800 mt-1 text-lg">
                    {userProfile.firstName && userProfile.lastName
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : userProfile.name || "N/A"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">Email</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.email || "N/A"}</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">Phone Number</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.phoneNumber || "N/A"}</p>
                </div>

                {/* User ID */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">User ID</label>
                  <p className="text-gray-800 mt-1 text-sm font-mono break-all">{userProfile._id || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Address Information</h2>
              
              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">Street</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.address?.street || "N/A"}</p>
                </div>

                {/* City */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">City</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.address?.city || "N/A"}</p>
                </div>

                {/* State */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">State</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.address?.state || "N/A"}</p>
                </div>

                {/* Zipcode */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">Zipcode</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.address?.zipcode || "N/A"}</p>
                </div>

                {/* Country */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">Country</label>
                  <p className="text-gray-800 mt-1 text-lg">{userProfile.address?.country || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Created */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Account Created</label>
                <p className="text-gray-800 mt-1 text-lg">
                  {userProfile.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "N/A"}
                </p>
              </div>

              {/* Last Updated */}
              <div>
                <label className="text-sm text-gray-600 font-medium">Last Updated</label>
                <p className="text-gray-800 mt-1 text-lg">
                  {userProfile.updatedAt 
                    ? new Date(userProfile.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Mode Action Buttons */}
      {isEditing && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveProfile}
            disabled={isUpdating}
            className={`px-8 py-3 rounded text-white font-medium ${
              isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="px-8 py-3 rounded bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
