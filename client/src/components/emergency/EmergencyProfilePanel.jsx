import { useState, useEffect } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import "./EmergencyProfilePanel.css";

export default function EmergencyProfilePanel() {
  const { emergencyProfile, updateProfile } = useEmergency();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(emergencyProfile);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "family",
  });

  useEffect(() => {
    setProfileData(emergencyProfile);
  }, [emergencyProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => {
      const keys = name.split(".");
      if (keys.length === 1) {
        return { ...prev, [name]: value };
      } else {
        return {
          ...prev,
          [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
        };
      }
    });
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert("Please fill in name and phone");
      return;
    }

    setProfileData((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));

    setNewContact({ name: "", phone: "", email: "", relationship: "family" });
  };

  const handleRemoveContact = (index) => {
    setProfileData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updateProfile(profileData);
    setIsEditing(false);
  };

  const contactsComplete = profileData.emergencyContacts.length > 0;
  const profileComplete = profileData.name && profileData.phone && contactsComplete;

  return (
    <section className="emergency-profile-panel">
      <div className="profile-header">
        <h3 className="title">👤 Emergency Profile</h3>
        <span className={`completeness ${profileComplete ? "complete" : "incomplete"}`}>
          {profileComplete ? "✓ Complete" : "⚠ Incomplete"}
        </span>
      </div>

      {!profileComplete && (
        <div className="alert alert-warning">
          <AlertCircle size={16} />
          <span>Complete your emergency profile to enable SOS features</span>
        </div>
      )}

      <div className="profile-section">
        <h4>Personal Information</h4>
        <div className="input-group">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            disabled={!isEditing}
            className="input"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            name="phone"
            value={profileData.phone}
            onChange={handleProfileChange}
            disabled={!isEditing}
            className="input"
          />
          <input
            type="text"
            placeholder="Address"
            name="address"
            value={profileData.address}
            onChange={handleProfileChange}
            disabled={!isEditing}
            className="input"
          />
        </div>
      </div>

      <div className="profile-section">
        <h4>Medical Information</h4>
        <div className="input-group">
          <select
            name="bloodGroup"
            value={profileData.bloodGroup}
            onChange={handleProfileChange}
            disabled={!isEditing}
            className="input"
          >
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
          <input
            type="text"
            placeholder="Allergies (comma separated)"
            value={profileData.allergies?.join(", ") || ""}
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                allergies: e.target.value.split(",").map((a) => a.trim()),
              }))
            }
            disabled={!isEditing}
            className="input"
          />
          <input
            type="text"
            placeholder="Medical Conditions (comma separated)"
            value={profileData.medicalConditions?.join(", ") || ""}
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                medicalConditions: e.target.value.split(",").map((c) => c.trim()),
              }))
            }
            disabled={!isEditing}
            className="input"
          />
        </div>
      </div>

      <div className="profile-section">
        <h4>Emergency Contacts ({profileData.emergencyContacts.length})</h4>

        <div className="contacts-list">
          {profileData.emergencyContacts.map((contact, index) => (
            <div key={index} className="contact-item">
              <div className="contact-info">
                <strong>{contact.name}</strong>
                <span className="relationship">{contact.relationship}</span>
                <p>{contact.phone}</p>
                {contact.email && <p className="email">{contact.email}</p>}
              </div>
              {isEditing && (
                <button
                  className="btn-delete"
                  onClick={() => handleRemoveContact(index)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="add-contact">
            <h5>Add Contact</h5>
            <div className="input-group">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="input"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="input"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="input"
              />
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="input"
              >
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="other">Other</option>
              </select>
              <button className="btn-add" onClick={handleAddContact}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="profile-actions">
        {!isEditing ? (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <>
            <button className="btn-save" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </>
        )}
      </div>
    </section>
  );
}
