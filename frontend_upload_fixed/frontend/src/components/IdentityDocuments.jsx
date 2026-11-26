import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MODIFY_USER, profilePhoto, registeration, uploadIdentityFile } from "../store/action/userAppStorage";
import styles from "./IdentityDocuments.module.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function IdentityDocuments() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userAuth.user);
  const [identityFile, setIdentityFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const identityDone = Boolean(user?.passportUrl);
  const profileDone = Boolean(user?.profilePhotoUrl);
  const complete = identityDone && profileDone;

  const identityPreview = useMemo(
    () => identityFile ? URL.createObjectURL(identityFile) : "",
    [identityFile]
  );
  const profilePreview = useMemo(
    () => profileFile ? URL.createObjectURL(profileFile) : "",
    [profileFile]
  );

  useEffect(() => () => {
    if (identityPreview) URL.revokeObjectURL(identityPreview);
  }, [identityPreview]);

  useEffect(() => () => {
    if (profilePreview) URL.revokeObjectURL(profilePreview);
  }, [profilePreview]);

  const validateFile = (file) => {
    if (!file) return "Choose an image to continue.";
    if (!ACCEPTED_TYPES.includes(file.type)) return "Use a JPG, PNG or WEBP image.";
    if (file.size > MAX_FILE_SIZE) return "Each image must be 5 MB or smaller.";
    return "";
  };

  const handleFile = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }
    setError("");
    setSuccess("");
    if (type === "identity") setIdentityFile(file);
    else setProfileFile(file);
  };

  const uploadToStorage = async (file, documentType) => {
    const result = await dispatch(uploadIdentityFile(file, documentType));
    if (!result.bool) throw new Error(result.message || "Upload failed. Please try again.");
    return result.fileUrl;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!identityDone && !identityFile) {
      setError("Please choose a photo of your government-issued ID.");
      return;
    }
    if (!profileDone && !profileFile) {
      setError("Please choose a profile photo.");
      return;
    }

    setLoading(true);
    try {
      let identityUrl = user?.passportUrl || "";
      let profileUrl = user?.profilePhotoUrl || "";

      if (identityFile) identityUrl = await uploadToStorage(identityFile, "identity");
      if (profileFile) profileUrl = await uploadToStorage(profileFile, "profile");

      if (identityFile) {
        const savedIdentity = await dispatch(registeration({
          Nid: user?.nid,
          country: user?.country,
          state: user?.state,
          address: user?.address,
          passportUrl: identityUrl
        }));
        if (!savedIdentity.bool) throw new Error(savedIdentity.message || "Your ID document could not be saved.");
        const identityUpdatedUser = { ...user, passportUrl: identityUrl, infoVerified: true };
        localStorage.setItem("user", JSON.stringify(identityUpdatedUser));
        dispatch({ type: MODIFY_USER, payload: { user: identityUpdatedUser } });
      }

      if (profileFile) {
        const savedProfile = await dispatch(profilePhoto({ profilePhotoUrl: profileUrl }));
        if (!savedProfile.bool) throw new Error(savedProfile.message || "Your profile photo could not be saved.");
      }

      const updatedUser = {
        ...user,
        passportUrl: identityUrl,
        profilePhotoUrl: profileUrl,
        infoVerified: true,
        photoVerified: Boolean(profileUrl)
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: MODIFY_USER, payload: { user: updatedUser } });
      setIdentityFile(null);
      setProfileFile(null);
      setSuccess("Your photos have been uploaded successfully. Your documents are now on your account.");
    } catch (uploadError) {
      setError(uploadError.message || "Something went wrong while uploading your documents.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (complete) return null;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>ACCOUNT SETUP</span>
          <h3>Complete your identity profile</h3>
          <p>Your account is ready. Add these two photos from your dashboard to complete your profile.</p>
        </div>
        <div className={styles.status}><span /> Documents pending</div>
      </div>

      <form onSubmit={submit}>
        <div className={styles.uploadGrid}>
          <div className={styles.uploadTile}>
            <div className={styles.tileTop}>
              <span className={styles.tileIcon}>▤</span>
              <span className={identityDone ? styles.done : styles.pending}>{identityDone ? "Uploaded" : "Required"}</span>
            </div>
            <h4>Government-issued ID</h4>
            <p>Upload a clear photo of your passport, national ID or driver's licence.</p>
            <div className={styles.preview}>
              {identityPreview ? <img src={identityPreview} alt="Selected identity document preview" /> :
                identityDone ? <img src={user.passportUrl} alt="Uploaded identity document" /> :
                <span className={styles.placeholder}>ID PHOTO</span>}
            </div>
            {!identityDone && <label className={styles.fileButton}>Choose ID photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e, "identity")} /></label>}
          </div>

          <div className={styles.uploadTile}>
            <div className={styles.tileTop}>
              <span className={styles.tileIcon}>◉</span>
              <span className={profileDone ? styles.done : styles.pending}>{profileDone ? "Uploaded" : "Required"}</span>
            </div>
            <h4>Profile photo</h4>
            <p>Choose a recent, clear photo of yourself. Your face should be easy to see.</p>
            <div className={`${styles.preview} ${styles.profilePreview}`}>
              {profilePreview ? <img src={profilePreview} alt="Selected profile photo preview" /> :
                profileDone ? <img src={user.profilePhotoUrl} alt="Uploaded profile photo" /> :
                <span className={styles.placeholder}>YOUR PHOTO</span>}
            </div>
            {!profileDone && <label className={styles.fileButton}>Choose profile photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e, "profile")} /></label>}
          </div>
        </div>

        <div className={styles.footer}>
          <p>JPG, PNG or WEBP · Maximum 5 MB per image</p>
          <button type="submit" disabled={loading || complete}>{loading ? "Uploading..." : "Upload documents"}</button>
        </div>
        {error && <div className={styles.error} role="alert">{error}</div>}
        {success && <div className={styles.success} role="status">{success}</div>}
      </form>
    </section>
  );
}

export default IdentityDocuments;
