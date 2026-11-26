import React, { Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import "./App.css";
import "./brand-polish.css";
import "./banking-dashboard-refresh.css";

import FallBackComponent from "./components/Fallback";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded screens
const Home = React.lazy(() => import("./screens/Home"));
const About = React.lazy(() => import("./screens/About"));
const Card = React.lazy(() => import("./screens/Cards"));
const Contact = React.lazy(() => import("./screens/Contact"));
const Faq = React.lazy(() => import("./screens/Faq"));
const Current = React.lazy(() => import("./screens/Current"));
const Savings = React.lazy(() => import("./screens/Savings"));

const Login = React.lazy(() => import("./screens/Login"));
const Signup = React.lazy(() => import("./screens/Signup"));

const ForgetPassword = React.lazy(() =>
  import("./screens/ForgetPassword")
);

const ResetPassword = React.lazy(() =>
  import("./screens/ResetPassword")
);

const Sucess = React.lazy(() => import("./screens/Sucess"));
const Dashboard = React.lazy(() => import("./screens/Dashboard"));
const Transfer = React.lazy(() => import("./screens/FundTransfer"));
const BillPay = React.lazy(() => import("./screens/BillPay"));
const SendCard = React.lazy(() => import("./screens/SendToCard"));
const SendAccount = React.lazy(() => import("./screens/SendToAccount"));

const Notification = React.lazy(() => import("./screens/Notifications"));

const TransactionHistory = React.lazy(() =>
  import("./screens/TransactionHistory")
);

const Profile = React.lazy(() => import("./screens/Profile"));
const Settings = React.lazy(() => import("./screens/Settings"));
const Privacy = React.lazy(() => import("./screens/Privacy"));
const Help = React.lazy(() => import("./screens/Help"));
const Deposit = React.lazy(() => import("./screens/Deposit"));

const Beneficiaries = React.lazy(() =>
  import("./screens/Beneficiaries")
);

const AddBeneficiaries = React.lazy(() =>
  import("./screens/AddBeneficiaries")
);

const Invite = React.lazy(() => import("./screens/Invite"));
const NewCard = React.lazy(() => import("./screens/NewCard"));
const CardForm = React.lazy(() => import("./screens/CardForm"));

const Withdraw = React.lazy(() => import("./screens/Withdraw"));

const Tax = React.lazy(() => import("./screens/TaxCode"));
const TAC = React.lazy(() => import("./screens/TACcode"));
const NRC = React.lazy(() => import("./screens/NRCcode"));
const IMF = React.lazy(() => import("./screens/IMFcode"));
const COT = React.lazy(() => import("./screens/COTcode"));
const BSA = React.lazy(() => import("./screens/BsaCode"));

const OTP = React.lazy(() => import("./screens/OneTimePassword"));
const Loan = React.lazy(() => import("./screens/Loan"));

const CardDetails = React.lazy(() => import("./screens/CardDetails"));
const NewCardForm = React.lazy(() => import("./screens/NewCardForm"));


function App() {
  return (
    <div className="App">
      <Suspense fallback={<FallBackComponent />}>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          {/* Accessible without authentication */}

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/cards" element={<Card />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/current" element={<Current />} />
          <Route path="/savings" element={<Savings />} />

          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Registration and verification flows */}
          <Route path="/verify/:id" element={<Navigate to="/login" replace />} />
          <Route
            path="/verification/:id"
            element={<Navigate to="/login" replace />}
          />

          

          <Route
            path="/forgetpassword"
            element={<ForgetPassword />}
          />

          <Route
            path="/resetpassword/:token"
            element={<ResetPassword />}
          />

          <Route path="/phonesignup" element={<Navigate to="/login" replace />} />
          <Route
            path="/phoneverification"
            element={<Navigate to="/login" replace />}
          />

          <Route path="/success" element={<Sucess />} />


          {/* ================= PROTECTED ROUTES ================= */}
          {/* All routes nested below require a valid userToken */}

          <Route element={<ProtectedRoute />}>

          <Route
            path="/registeration"
            element={<Navigate to="/dashboard" replace />}
          />

            {/* Dashboard */}
            <Route path="/profilephoto" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Dashboard />} />

            {/* Transfers and payments */}
            <Route path="/transfer" element={<SendAccount />} />
            <Route path="/billpay" element={<BillPay />} />
            <Route path="/send-card" element={<SendCard />} />
            <Route path="/send-account" element={<SendAccount />} />

            {/* Account */}
            <Route path="/notifications" element={<Notification />} />
            <Route
              path="/transaction-history"
              element={<TransactionHistory />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help" element={<Help />} />

            {/* Funds */}
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />

            {/* Beneficiaries */}
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route
              path="/add-beneficiaries"
              element={<AddBeneficiaries />}
            />
            <Route path="/invite" element={<Invite />} />

            {/* Cards */}
            <Route path="/new-card" element={<Dashboard />} />
            <Route path="/card-form" element={<CardForm />} />
            <Route path="/card" element={<CardForm />} />
            <Route path="/new-card-form" element={<NewCardForm />} />
            <Route
              path="/card-details/:id"
              element={<CardDetails />}
            />

            {/* Banking codes */}
            <Route path="/tax" element={<Tax />} />
            <Route path="/bsa" element={<BSA />} />
            <Route path="/tac" element={<TAC />} />
            <Route path="/nrc" element={<NRC />} />
            <Route path="/imf" element={<IMF />} />
            <Route path="/cot" element={<COT />} />

            {/* OTP and loans */}
            <Route path="/otp" element={<OTP />} />
            <Route path="/loan" element={<Loan />} />

          </Route>

        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

