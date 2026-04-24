import { useEffect, useRef, useState } from "react";

export default function ProfileSection({
  profile,
  onSave,
  onShowFollowers,
  onShowFollowing
}) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    course: "",
    year: "",
    email: "",
    avatarUrl: ""
  });

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      bio: profile?.bio || "",
      course: profile?.course || "",
      year: profile?.year || "",
      email: profile?.email || "",
      avatarUrl: profile?.avatarUrl || ""
    });
  }, [profile]);

  return (
    <section className="stack">
      <section className="card profile-hero">
        <div className="profile-banner" />
        <div className="profile-header">
          <div className="profile-identity">
            <button
              className="profile-avatar profile-avatar-button"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              {profile?.avatarUrl ? (
                <img alt="Profile" className="profile-image" src={profile.avatarUrl} />
              ) : (
                (profile?.name || "S").slice(0, 1).toUpperCase()
              )}
            </button>
            <div>
              <p className="eyebrow">Personal Profile</p>
              <h1>{profile?.name || "Student"}</h1>
              <p className="muted">{profile?.email}</p>
              <p className="muted">Tap the circular badge to update your profile photo.</p>
            </div>
          </div>
          <div className="toolbar">
            <button className="secondary-btn" onClick={onShowFollowers} type="button">
              Followers {profile?.followers?.length || 0}
            </button>
            <button className="secondary-btn" onClick={onShowFollowing} type="button">
              Following {profile?.following?.length || 0}
            </button>
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Edit Profile</p>
            <h2>Make your profile feel personal</h2>
          </div>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input value={form.email} disabled />
          </label>
          <label className="field">
            <span>Course</span>
            <input
              placeholder="BCA, BTech CSE, MCA..."
              value={form.course}
              onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Year / Semester</span>
            <input
              placeholder="Semester 6"
              value={form.year}
              onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
            />
          </label>
        </div>

        <label className="field">
          <span>Bio</span>
          <textarea
            placeholder="Tell others what subjects you like and what kind of notes you share."
            rows="4"
            value={form.bio}
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          />
        </label>

        <input
          accept="image/*"
          className="hidden-input"
          ref={fileInputRef}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () =>
              setForm((current) => ({
                ...current,
                avatarUrl: reader.result
              }));
            reader.readAsDataURL(file);
          }}
        />

        {form.avatarUrl ? (
          <div className="profile-photo-preview">
            <img alt="Profile preview" className="profile-photo-preview-image" src={form.avatarUrl} />
          </div>
        ) : null}

        <button className="primary-btn" onClick={() => onSave(form)} type="button">
          Save Profile
        </button>
      </section>
    </section>
  );
}
