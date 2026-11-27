import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Home.module.css';

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { userToken } = useSelector((state) => state.userAuth);

  const features = [
    {
      icon: '↗',
      title: 'Move money with ease',
      text: 'Make everyday transfers and payments with a smooth, simple banking experience.',
    },
    {
      icon: '◈',
      title: 'Built around your goals',
      text: 'Tools that help you save with purpose and keep your financial plans moving.',
    },
    {
      icon: '⌁',
      title: 'Security at every step',
      text: 'Modern account safeguards and thoughtful controls help keep your banking protected.',
    },
  ];

  return (
    <main className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <a
          className={styles.brand}
          href="/"
          aria-label="Zentrixx Bank home"
        >
          <img src="front/img/faviconi.png" alt="Zentrixx Bank" />
        </a>

        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <a className={styles.active} href="/">
            Home
          </a>

          <a href="/savings">Personal</a>
          <a href="/current">Accounts</a>
          <a href="/about">About</a>
          <a href="/cards">Cards</a>
          <a href="/faq">Support</a>

          <div className={styles.navActions}>
            <a className={styles.signIn} href={userToken ? '/dashboard' : '/login'}>
              {userToken ? 'Dashboard' : 'Sign in'}
            </a>

            <a className={styles.getStarted} href="/signup">
              Open an account <span>↗</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.dot}></span>
            Banking, reimagined
          </div>

          <h1>
            Make your money
            <br />
            <em>move with you.</em>
          </h1>

          <p>
            More clarity. More control. More room to grow. Experience banking
            designed around the life you’re building.
          </p>

          <div className={styles.heroButtons}>
            <a href="/signup" className={styles.primary}>
              Start banking <span>↗</span>
            </a>

            <a href="/about" className={styles.secondary}>
              Discover Zentrixx <span>→</span>
            </a>
          </div>

          <div className={styles.trustLine}>
            <span className={styles.trustIcon}>✓</span>
            Simple banking, backed by thoughtful security
          </div>
        </div>

        {/* Product-led banking visual */}
       <div
  className={styles.heroVisual}
  aria-label="Zentrixx digital banking dashboard preview"
>
  <div className={styles.visualBackdrop}></div>

  <div className={styles.visualTopline}>
    <span className={styles.liveDot}></span>
    <span>YOUR FINANCES, IN FOCUS</span>
    <span className={styles.visualTag}>ZENTRIXX / 01</span>
  </div>

  <div className={styles.dashboardCard}>
    <div className={styles.dashHeader}>
      <div className={styles.dashBrand}>
        <span className={styles.dashMark}>Z</span>
        <span>
          Zentrixx <small>PERSONAL</small>
        </span>
      </div>

      <div className={styles.dashAvatar}>JD</div>
    </div>

    <div className={styles.balanceLabel}>TOTAL AVAILABLE</div>

    <div className={styles.balanceValue}>
      $ 2,480,650<span>.00</span>
    </div>

    <div className={styles.balanceMeta}>
      <span className={styles.balancePositive}>↗ 12.8%</span>
      <span>from last month</span>
    </div>

    <div className={styles.dashActions}>
      <div>
        <b>↗</b>
        <span>Transfer</span>
      </div>

      <div>
        <b>＋</b>
        <span>Add money</span>
      </div>

      <div>
        <b>▤</b>
        <span>Pay bills</span>
      </div>

      <div>
        <b>•••</b>
        <span>More</span>
      </div>
    </div>

    <div className={styles.activityHead}>
      <strong>Recent activity</strong>
      <a href="/transaction-history">See all</a>
    </div>

    <div className={styles.activityRow}>
      <span className={styles.activityIcon}>↗</span>

      <div>
        <b>Transfer to Ada</b>
        <small>Today · 10:42 AM</small>
      </div>

      <strong className={styles.amountOut}>− $25,000</strong>
    </div>

    <div className={styles.activityRow}>
      <span className={`${styles.activityIcon} ${styles.incoming}`}>
        ↓
      </span>

      <div>
        <b>Salary payment</b>
        <small>Today · 8:15 AM</small>
      </div>

      <strong className={styles.amountIn}>+ $450,000</strong>
    </div>
  </div>

  <div className={styles.cardShowcase}>
    <div className={styles.bankCard}>
      <div className={styles.bankCardTop}>
        <span className={styles.cardBrand}>
          ZENTRIXX<span> BANK</span>
        </span>

        <span className={styles.cardContactless}>)))</span>
      </div>

      <div className={styles.cardChipVisual}>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>

      <div className={styles.cardNumber}>
        •••• &nbsp; •••• &nbsp; •••• &nbsp; 4829
      </div>

      <div className={styles.bankCardBottom}>
        <span>JANE DOE</span>
        <span>
          VISA <small>••</small>
        </span>
      </div>
    </div>

    <div className={styles.transferToast}>
      <span className={styles.toastCheck}>✓</span>

      <div>
        <b>Transfer successful</b>
        <small>$125,000 sent securely</small>
      </div>
    </div>
  </div>

  <div className={styles.chartFloat}>
    <div className={styles.chartTitle}>
      Savings progress <span>+8.4%</span>
    </div>

    <div className={styles.sparkBars}>
      {Array.from({ length: 12 }, (_, index) => (
        <i key={index}></i>
      ))}
    </div>

    <small>Consistent growth, one step at a time.</small>
  </div>
</div>

        {/* Hero Bottom */}
        <div className={styles.heroBottom}>
          <span>01 / PERSONAL BANKING</span>

          <span className={styles.scroll}>
            SCROLL TO EXPLORE ↓
          </span>
        </div>
      </section>

      {/* Intro Section */}
      <section className={styles.intro}>
        <div className={styles.introLabel}>
          THE ZENTRIXX DIFFERENCE
        </div>

        <div className={styles.introText}>
          <h2>
            Everyday banking.
            <br />
            <span>Elevated.</span>
          </h2>

          <p>
            We believe banking should feel empowering, not complicated.
            Zentrixx brings your essential financial tools together in a
            clear, convenient experience that helps you make confident
            moves—today and tomorrow.
          </p>

          <a href="/about">
            Meet Zentrixx <span>↗</span>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <div>
            <span>MADE FOR REAL LIFE</span>

            <h2>
              Banking that works
              <br />
              beautifully.
            </h2>
          </div>

          <p>
            From the small daily moments to your bigger ambitions, we’re
            here to make the journey feel simpler.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((item, i) => (
            <article className={styles.feature} key={item.title}>
              <div className={styles.featureNum}>
                0{i + 1}
              </div>

              <div className={styles.featureIcon}>
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>

              <a
                href={i === 1 ? '/savings' : '/about'}
                aria-label={`Learn more about ${item.title}`}
              >
                Explore <span>↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaMark}>Z</div>

        <div>
          <span>YOUR NEXT CHAPTER STARTS NOW</span>

          <h2>
            Let’s make a smarter
            <br />
            move together.
          </h2>
        </div>

        <a href="/signup">
          Open your account <span>↗</span>
        </a>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <a className={styles.footerBrand} href="/">
          <img
            src="front/img/faviconi.png"
            alt="Zentrixx Bank"
          />
        </a>

        <div className={styles.footerLinks}>
          <a href="/about">About</a>
          <a href="/cards">Cards</a>
          <a href="/faq">FAQs</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
        </div>

        <p>
          © {new Date().getFullYear()} Zentrixx Bank. Banking beyond limits.
        </p>
      </footer>
    </main>
  );
};

export default HomePage;
