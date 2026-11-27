import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signup } from "../store/action/userAppStorage";
import styles from "./SignupCarousel.module.css";

const steps = [
  { title: "Your details", subtitle: "Let's start with the basics." },
  { title: "Secure your account", subtitle: "Choose a strong password." },
  { title: "Contact information", subtitle: "How can we reach you?" },
  { title: "Your address", subtitle: "A few details to set up your profile." },
];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  nid: "",
  country: "",
  state: "",
  address: "",
};

function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim()) return "Enter your first and last name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
    }
    if (step === 1) {
      if (form.password.length < 8) return "Your password must contain at least 8 characters.";
      if (form.password !== form.confirmPassword) return "Your passwords do not match.";
    }
    if (step === 2) {
      const digits = form.phoneNumber.replace(/[^\d]/g, "");
      if (digits.length < 7 || digits.length > 15) return "Enter a valid phone number, including your country code.";
    }
    if (step === 3) {
      if (!form.nid.trim()) return "Enter your government-issued ID number.";
      if (!form.country.trim() || !form.state.trim() || !form.address.trim()) return "Complete your country, state/region and residential address.";
      if (!acceptedTerms) return "Please accept the Terms of Service and Privacy Policy to continue.";
    }
    return "";
  };

  const next = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const previous = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const submit = async (event) => {
    event.preventDefault();
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    setLoading(true);
    setError("");
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      phoneNumber: form.phoneNumber.trim(),
      nid: form.nid.trim(),
      country: form.country.trim(),
      state: form.state.trim(),
      address: form.address.trim(),
    };

    try {
      const result = await dispatch(signup(payload));
      if (!result?.bool) {
        setError(result?.message || "We couldn't create your account. Please try again.");
        setLoading(false);
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <label className={styles.field} key={name}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={update}
        placeholder={placeholder || label}
        autoComplete={name === "email" ? "email" : name.toLowerCase().includes("password") ? "new-password" : "on"}
        required
      />
    </label>
  );

  return (
    <main className={styles.page}>
      <section className={styles.visualPanel}>
        <div className={styles.brand}><span className={styles.brandMark}>✦</span> ZENTRIXX</div>
        <div className={styles.visualCopy}>
          <span className={styles.eyebrow}>BANKING, MADE SIMPLE</span>
          <h1>A better way to move your money.</h1>
          <p>Open your account in a few simple steps. You can securely add your identity photos from your dashboard after signup.</p>
        </div>
        <div className={styles.visualCard}>
          <div className={styles.cardTop}><span>ZENTRIXX</span><b>◈</b></div>
          <div className={styles.cardChip} />
          <div className={styles.cardDigits}>•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</div>
          <div className={styles.cardBottom}><span>YOUR ACCOUNT</span><span>✦</span></div>
        </div>
        <div className={styles.visualFoot}>Secure digital banking · Simple onboarding</div>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.formCard} onSubmit={submit}>
          <div className={styles.topline}>
            <button type="button" className={styles.backLink} onClick={() => navigate("/")} aria-label="Back to home">← Home</button>
            <span className={styles.stepCount}>STEP {step + 1} OF {steps.length}</span>
          </div>

          <div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div>

          <div className={styles.heading}>
            <span className={styles.kicker}>CREATE YOUR ACCOUNT</span>
            <h2>{steps[step].title}</h2>
            <p>{steps[step].subtitle}</p>
          </div>

          <div className={styles.carouselViewport}>
            <div className={styles.stepContent} key={step}>
              {step === 0 && (
                <>
                  <div className={styles.twoColumns}>
                    {field("First name", "firstName")}
                    {field("Last name", "lastName")}
                  </div>
                  {field("Email address", "email", "email", "you@example.com")}
                  <div className={styles.helper}>No email verification is required to create your account.</div>
                </>
              )}

              {step === 1 && (
                <>
                  <label className={styles.field}>
                    <span>Password</span>
                    <div className={styles.passwordWrap}>
                      <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update} placeholder="At least 8 characters" autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
                    </div>
                  </label>
                  {field("Confirm password", "confirmPassword", "password")}
                  <div className={styles.helper}>Use at least 8 characters. Avoid using a password you use elsewhere.</div>
                </>
              )}

              {step === 2 && (
                <>
                  {field("Phone number (include country code)", "phoneNumber", "tel", "+1 555 123 4567")}
                  <div className={styles.infoBox}><span>i</span><p>Your phone number is saved to your account. You won't be asked to complete an SMS verification step during signup.</p></div>
                </>
              )}

              {step === 3 && (
                <>
                  {field("Government-issued ID number", "nid", "text", "Passport, national ID or driver's licence number")}
                  <div className={styles.twoColumns}>
                    {field("Country", "country", "text", "Country")}
                    {field("State / Region", "state", "text", "State or region")}
                  </div>
                  <label className={styles.field}>
                    <span>Residential address</span>
                    <textarea name="address" value={form.address} onChange={update} placeholder="Street address, city and postal code" rows={3} required />
                  </label>
                  <label className={styles.terms}>
                    <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                    <span>I agree to the Terms of Service and Privacy Policy.</span>
                  </label>
                  <div className={styles.infoBox}><span>✓</span><p>You'll upload your profile photo and ID document securely from your dashboard after creating your account.</p></div>
                </>
              )}
            </div>
          </div>

          {error && <div className={styles.error} role="alert">{error}</div>}

          <div className={styles.actions}>
            {step > 0 && <button type="button" className={styles.secondaryButton} onClick={previous} disabled={loading}>Back</button>}
            {step < steps.length - 1 ? (
              <button type="button" className={styles.primaryButton} onClick={next}>Continue <span>→</span></button>
            ) : (
              <button type="submit" className={styles.primaryButton} disabled={loading}>{loading ? "Creating account..." : "Create account"} <span>→</span></button>
            )}
          </div>

          <p className={styles.loginPrompt}>Already have an account? <button type="button" onClick={() => navigate("/login")}>Sign in</button></p>
          <div className={styles.trustLine}><span>▣</span> Your information is protected and encrypted.</div>
        </form>
      </section>
    </main>
  );
}

export default SignupPage;
