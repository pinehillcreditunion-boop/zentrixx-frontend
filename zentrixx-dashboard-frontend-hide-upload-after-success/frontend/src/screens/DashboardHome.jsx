import React, { useState } from 'react';
import styles from './DashboardHome.module.css';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Tab from '../components/Tab';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import Wallet from '../components/Wallet';
import MenuCard from '../components/MenuCard';

let menuData = [
    {
        icon: 'payments',
        title: 'Deposit',
        url: 'deposit'
    },
    {
        icon: 'toll',
        title: 'Send Money',
        url: 'send-card'
    },
    {
        icon: 'people',
        title: 'Manage friends',
        url: 'beneficiaries'
    },
    {
        icon: 'add_card',
        title: 'Bill Pay',
        url: 'billpay'
    },
    {
        icon: 'book',
        title: 'All Budget',
        url: 'dashboard'
    },
    {
        icon: 'settings',
        title: 'Branch Pay',
        url: 'dashboard'
    },
]





function DashboardHome() {

    let [preloader, setPreloader] = useState(true)
    let [isError, setIsError] = useState(false)
    let [isErrorInfo, setIsErrorInfo] = useState('')
    let [isLoading, setIsLoading] = useState(false)
    let [isUrl, setIsUrl] = useState(false)


    //initialising reduzx
    let dispatch = useDispatch()
    let { color } = useSelector(state => state.userAuth)
    //initialise router
    let navigate = useNavigate()

    //loaders state





    /*useEffect(() => {
        setTimeout(() => {
            setPreloader(false)
        }, 5000)
    }, [])*/

    let navigateHandler = (data) => {
        navigate(`/${data}`)
    }











    return (<>
        <div className={styles.screenContainer}>
            <SideBar />
            <div className={styles.maindashboard}>
                <Header home={true} title={'Home'} />
                <main className={styles.mainscreen}>
                    <section className={styles.welcomeHero} aria-label="Dashboard welcome">
                        <div className={styles.heroContent}>
                            <span className={styles.heroEyebrow}><span className={styles.heroEyebrowDot} /> ZENTRIXX DIGITAL BANKING</span>
                            <h1>Money moves.<br /><em>Life moves forward.</em></h1>
                            <p>Everything you need to stay in control, all in one beautifully simple place.</p>
                            <div className={styles.heroTrust}><span className="material-icons">verified_user</span> Secure banking, built around you</div>
                        </div>
                        <div className={styles.heroArtwork} aria-hidden="true">
                            <div className={styles.heroGlow} />
                            <div className={styles.heroOrbit heroOrbitOne} />
                            <div className={styles.heroOrbit heroOrbitTwo} />
                            <div className={styles.heroGlassCard}>
                                <span className={styles.glassCardBrand}>ZENTRIXX <b>✦</b></span>
                                <div className={styles.glassCardChip} />
                                <div className={styles.glassCardDigits}>•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</div>
                                <div className={styles.glassCardBottom}><span>PREMIUM ACCOUNT</span><span className={styles.glassCardMark}>◈</span></div>
                            </div>
                            <div className={styles.heroFloatBadge}><span className="material-icons">bolt</span><div><strong>Smart & simple</strong><small>Banking, reimagined</small></div></div>
                        </div>
                    </section>

                    <div className={styles.dashboardGrid}>
                        <section className={styles.mainscreenleft}>
                            <div className={styles.sectionHeading}>
                                <div><span className={styles.sectionEyebrow}>YOUR FINANCES</span><h2>Wallet overview</h2></div>
                                <span className={styles.liveBadge}><i /> Live</span>
                            </div>
                            <Wallet />
                        </section>

                        <section className={styles.mainscreenright}>
                            <div className={styles.sectionHeading}>
                                <div><span className={styles.sectionEyebrow}>AT YOUR FINGERTIPS</span><h2>Quick actions</h2></div>
                            </div>
                            <div className={styles.menuContainer}>
                                {menuData.map(data => <MenuCard key={data.icon} data={data} fun={navigateHandler} />)}
                            </div>
                            <div className={styles.securityCard}>
                                <div className={styles.securityIcon}><span className="material-icons">shield</span></div>
                                <div><strong>Your security matters</strong><p>Your banking experience is protected with secure account safeguards.</p></div>
                                <span className="material-icons securityArrow">arrow_forward</span>
                            </div>
                        </section>
                    </div>
                </main>


            </div>
        </div >



        {/* tab sections */}
        < Tab />
    </>);

}


export default DashboardHome