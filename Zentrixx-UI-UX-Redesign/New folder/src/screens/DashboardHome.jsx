import React from 'react';
import styles from './DashboardHome.module.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import Tab from '../components/Tab';

const actions = [
  { title: 'Transfer money', detail: 'Send to an account', icon: 'north_east', route: 'transfer', tone: 'blue' },
  { title: 'Add money', detail: 'Fund your wallet', icon: 'add', route: 'deposit', tone: 'green' },
  { title: 'Pay a bill', detail: 'Utilities & services', icon: 'receipt_long', route: 'billpay', tone: 'amber' },
  { title: 'Manage cards', detail: 'View your cards', icon: 'credit_card', route: 'card', tone: 'purple' },
];

function money(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DashboardHome() {
  const { user = {} } = useSelector(state => state.userAuth || {});
  const navigate = useNavigate();
  const firstName = user.firstName || 'there';

  return (
    <div className={styles.screenContainer}>
      <SideBar active="home" />
      <div className={styles.maindashboard}>
        <Header home title="Overview" />
        <main className={styles.mainscreen}>
          <div className={styles.pageIntro}>
            <div><p className={styles.dateLabel}>YOUR ACCOUNT OVERVIEW</p><h1>Good day, {firstName}</h1><p className={styles.introSub}>Here’s what’s happening with your money.</p></div>
            <button type="button" className={styles.supportButton} onClick={() => navigate('/help')}><span className="material-icons">support_agent</span> Help & support</button>
          </div>

          <section className={styles.balancePanel} aria-label="Account balance">
            <div className={styles.balanceLeft}>
              <div className={styles.balanceLabel}><span>Available balance</span><span className={styles.statusDot}>●</span></div>
              <div className={styles.balanceValue}>${money(user.walletBalance)}</div>
              <div className={styles.accountMeta}><span className="material-icons">account_balance</span> Zentrixx personal account <span className={styles.accountNumber}>•••• 2048</span></div>
            </div>
            <div className={styles.balanceActions}>
              <button type="button" onClick={() => navigate('/deposit')}><span className="material-icons">add</span> Add money</button>
              <button type="button" className={styles.lightAction} onClick={() => navigate('/transfer')}><span className="material-icons">north_east</span> Transfer</button>
            </div>
          </section>

          <section className={styles.statsGrid} aria-label="Today's account activity">
            <article className={styles.statCard}><div className={styles.statTop}><span>Earned today</span><span className={`${styles.statIcon} ${styles.greenIcon}`}><span className="material-icons">trending_up</span></span></div><strong>${money(user.totalEarn)}</strong><small>Income credited today</small></article>
            <article className={styles.statCard}><div className={styles.statTop}><span>Spent today</span><span className={`${styles.statIcon} ${styles.orangeIcon}`}><span className="material-icons">trending_down</span></span></div><strong>${money(user.totalSpent)}</strong><small>Payments and transfers</small></article>
            <article className={styles.statCard}><div className={styles.statTop}><span>Pending</span><span className={`${styles.statIcon} ${styles.blueIcon}`}><span className="material-icons">schedule</span></span></div><strong>$0.00</strong><small>Transactions awaiting completion</small></article>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><div><h2>Quick actions</h2><p>Common tasks, right where you need them.</p></div><button type="button" onClick={() => navigate('/settings')}>Manage account <span>→</span></button></div>
            <div className={styles.actionGrid}>{actions.map(action => <button type="button" key={action.route} className={styles.actionCard} onClick={() => navigate(`/${action.route}`)}><span className={`${styles.actionIcon} ${styles[action.tone]}`}><span className="material-icons">{action.icon}</span></span><span className={styles.actionText}><strong>{action.title}</strong><small>{action.detail}</small></span><span className={`material-icons ${styles.actionArrow}`}>arrow_forward</span></button>)}</div>
          </section>

          <section className={styles.bottomGrid}>
            <article className={styles.activityCard}>
              <div className={styles.sectionHeader}><div><h2>Recent activity</h2><p>Your latest account movements</p></div><button type="button" onClick={() => navigate('/transaction-history')}>View all <span>→</span></button></div>
              <div className={styles.emptyActivity}><span className="material-icons">receipt_long</span><strong>Your activity will appear here</strong><p>Once you make a payment or receive money, you’ll see it listed here.</p><button type="button" onClick={() => navigate('/transaction-history')}>Go to transaction history</button></div>
            </article>
            <article className={styles.securityCard}>
              <span className={styles.securityIcon}><span className="material-icons">shield</span></span><span className={styles.securityTag}>ACCOUNT SECURITY</span><h3>Your account, protected.</h3><p>Keep your account details up to date and use a strong password to help protect your banking.</p><button type="button" onClick={() => navigate('/settings')}>Security settings <span>→</span></button>
            </article>
          </section>
          <footer className={styles.dashboardFooter}><span>© Zentrixx Digital Banking</span><span><span className={styles.footerDot} /> Secure connection</span></footer>
        </main>
      </div>
      <Tab />
    </div>
  );
}
export default DashboardHome;
