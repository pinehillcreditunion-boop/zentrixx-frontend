import React, { useState } from 'react';
import styles from './Login.module.css';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { login } from '../store/action/userAppStorage';
import Modal from '../components/Modal/Modal';
import Loader from "../components/loader";

function LoginPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [isErrorInfo, setIsErrorInfo] = useState('');
  const [isUrl, setIsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!userEmail.trim() || !userPassword) return;
    setIsLoading(true);
    try {
      const response = await dispatch(login({ email: userEmail.trim(), password: userPassword }));
      if (response?.bool) {
        navigate(response.url || '/dashboard', { replace: true });
      } else {
        setIsErrorInfo(response?.message || 'Unable to sign in. Please check your details and try again.');
        setIsUrl(response?.url || '/login');
        setIsError(true);
      }
    } catch (error) {
      setIsErrorInfo(error?.message || 'Something went wrong. Please try again.');
      setIsUrl('/login');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsError(false);
    if (isUrl) navigate(isUrl);
  };

  return (
    <main className={styles.page}>
      {isError && <Modal content={isErrorInfo} closeModal={closeModal} />}
      {isLoading && <Loader />}
      <section className={styles.visualPanel} aria-label="Zentrixx banking">
        <div className={styles.brand}><span className={styles.brandMark}>✦</span> ZENTRIXX</div>
        <div className={styles.visualCopy}>
          <span className={styles.eyebrow}>YOUR MONEY. YOUR MOMENT.</span>
          <h1>Banking that<br />moves with you.</h1>
          <p>A clearer view of your money, and a simpler way to manage the everyday.</p>
          <div className={styles.trustLine}><span className="material-icons">verified_user</span> Thoughtful, secure digital banking</div>
        </div>
        <div className={styles.visualCard} aria-hidden="true">
          <div className={styles.cardTop}><span>ZENTRIXX</span><b>◈</b></div>
          <div className={styles.cardChip} />
          <div className={styles.cardDigits}>•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</div>
          <div className={styles.cardBottom}><span>YOUR ACCOUNT</span><span>✦</span></div>
        </div>
        <div className={styles.visualFoot}>Digital banking · Designed around you</div>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.formCard} onSubmit={submitHandler}>
          <div className={styles.topline}>
            <button type="button" className={styles.backLink} onClick={() => navigate('/')}>← Home</button>
            <span className={styles.stepCount}>WELCOME BACK</span>
          </div>
          <div className={styles.heading}>
            <span className={styles.kicker}>SIGN IN TO ZENTRIXX</span>
            <h2>Good to see you.</h2>
            <p>Enter your details to securely access your account.</p>
          </div>
          <div className={styles.fields}>
            <label className={styles.field}><span>Email address</span><input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
            <label className={styles.field}><span>Password</span><div className={styles.passwordWrap}><input type={showPassword ? 'text' : 'password'} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
          </div>
          <div className={styles.forgotRow}><button type="button" onClick={() => navigate('/forgetpassword')}>Forgot password?</button></div>
          <button type="submit" className={styles.primaryButton} disabled={isLoading}>{isLoading ? 'Signing in…' : 'Sign in'} <span>→</span></button>
          <p className={styles.loginPrompt}>New to Zentrixx? <button type="button" onClick={() => navigate('/signup')}>Create an account</button></p>
          <div className={styles.trustLine}><span>▣</span> Your sign-in details are protected.</div>
        </form>
      </section>
    </main>
  );
}
export default LoginPage;
