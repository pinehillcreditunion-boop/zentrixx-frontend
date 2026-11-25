import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Tab from '../components/Tab';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import WelcomeModal from '../components/Modal/WelcomeModal';
import PaymentModal from '../components/Modal/PaymentModal';
import { fetchDeposits, fetchAccounts } from '../store/action/userAppStorage';
import Modal from '../components/Modal/Modal';
import Loader from '../components/loader';
import Cards from 'react-credit-cards-2';
import IdentityDocuments from '../components/IdentityDocuments';
import 'react-credit-cards-2/dist/es/styles-compiled.css'


function Dashboard() {
    let [isError, setIsError] = useState(false)
    let [isUrl, setIsUrl] = useState(false)
    //initialising reduzx

    let { user, cards, loans, histories } = useSelector(state => state.userAuth)
    //initialise router
    let navigate = useNavigate()
    let [isWelcome, setIsWelcome] = useState(true)
    let [isShow, setIsShow] = useState(true)
    let [isPay, setIsPay] = useState(false)
    let [isDeposits, setIsDeposits] = useState([])
    let [amount, setAmount] = useState('')
    let [isLoading, setIsLoading] = useState(false)
    let [isErrorInfo, setIsErrorInfo] = useState('')
    let [isAccount, setIsAccount] = useState([])
    let [isReverse, setIsReverse] = useState(false)

    let dispatch = useDispatch()

   


    useEffect(() => {
        fetchDeposit()
        fetchAccount()
    }, [])


    let fetchDeposit = async () => {
        setIsLoading(true)
        let res = await dispatch(fetchDeposits())
        if (!res.bool) {
            setIsLoading(false)
            return
        }
        setIsDeposits(res.message.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }))
        setIsLoading(false)
    }

    let fetchAccount = async () => {
        setIsLoading(true)
        let res = await dispatch(fetchAccounts())
        if (!res.bool) {
            setIsLoading(false)
            return
        }
        setIsAccount(res.message)
        setIsLoading(false)
    }




    let navigateHandler = (data) => {
        navigate(`/${data}`)
    }

    let clickHandler = () => {
        setIsErrorInfo('Contact customer care support to continue')
        setIsError(true)
    }

    let menuHandler = (e) => {
        navigate(`/${e}`)
    }



    let reverseHandler = ()=>{
        if(isReverse){
            return
        }
        let arr = [...isDeposits].reverse()
        setIsDeposits(arr)
        setIsReverse(true)
    }

    let rereverseHandler = ()=>{
        if(!isReverse){
            return
        }
        let arr = [...isDeposits].reverse()
        setIsDeposits(arr)
        setIsReverse(false)

    }










    let closeWelcomeModal = () => {
        setIsWelcome(false)
    }

    let payHandler = () => {
        setIsPay(true)
    }

    let togglePayModal = () => {
        setIsPay(false)
    }

    let changeHandler = (dataType) => {
        setIsShow(prev => !prev)
    }

    let closeModal = () => {
        setIsError(false)
        setIsErrorInfo('')
    }

    let day = () => {
        var now = new Date(),
            hour = now.getHours();

        var morning = (hour >= 4 && hour <= 11),
            afternoon = (hour >= 12 && hour <= 16),
            evening = (hour >= 17 && hour <= 20),
            night = (hour >= 21 || hour <= 3);

        if (morning) {

            return 'MORNING'

        } else if (afternoon) {

            return 'AFTERNOON';

        } else if (evening) {

            return 'EVENING';

        } else if (night) {

            return 'NIGHT'

        }



    }

    let colorFun = (data) => {
        if (data === 'Transfer') {
            return 'red'
        } else if (data === 'Debit') {
            return 'red'

        } else if (data === 'withdraw') {
            return 'red'

        } else {
            return 'green'
        }


    }

    let newCardHandler = () => {
        navigate('/new-card-form')
    }







    return (<>
        {isLoading && <Loader />}
        {isError && <Modal closeModal={closeModal} content={isErrorInfo} />}
        {isPay ? <PaymentModal closeFun={togglePayModal} /> : ''}
        {isWelcome && <WelcomeModal closeFavorite={closeWelcomeModal} />}
        <div className={styles.screenContainer}>
            <SideBar active={'home'} />
            <div className={styles.maindashboard}>
                <Header home={true} title={'Dashboard'} />
                <main className={styles.mainscreen}>
                    <div className={styles.dashboardIntro}>
                        <div><span className={styles.eyebrow}>ACCOUNT OVERVIEW</span><h1>Good {day()}, {user?.firstName || 'there'}.</h1><p>Your accounts, cards and recent activity in one place.</p></div>
                        <button type="button" className={styles.helpButton} onClick={() => navigate('/help')}><span className="material-icons">support_agent</span> Support</button>
                    </div>

                    <IdentityDocuments />

                    <section className={styles.accountSection} aria-label="Bank accounts">
                        <div className={styles.sectionHeading}><div><h2>Accounts</h2><p>Balances across your accounts</p></div><button type="button" className={styles.addAccount} onClick={clickHandler}><span className="material-icons">add</span> Add account</button></div>
                        {isAccount.length ? <div className={styles.accountGrid}>{isAccount.map(data => <article className={styles.accountCard} key={data._id || data.accountNumber}>
                            <div className={styles.accountCardTop}><span className={styles.accountIcon}><span className="material-icons">account_balance</span></span><span className={styles.accountType}>{data.accountType || 'Bank account'}</span><span className={styles.accountStatus}>Active</span></div>
                            <p className={styles.accountLabel}>Available balance</p><strong className={styles.accountBalance}>${Intl.NumberFormat().format(data.Balance || 0)}.00</strong>
                            <div className={styles.accountCardFoot}><span>Account number</span><span>{data.accountNumber || '—'}</span></div>
                        </article>)}</div> : <div className={styles.noAccounts}><span className="material-icons">account_balance</span><strong>No bank accounts linked yet</strong><p>Your account balances will appear here once available.</p><button type="button" onClick={clickHandler}>Add account</button></div>}
                    </section>

                    <section className={styles.metricGrid} aria-label="Account counts">
                        <button type="button" className={styles.metricCard} onClick={() => menuHandler('transaction-history')}><span className={styles.metricIcon}><span className="material-icons">receipt_long</span></span><span className={styles.metricCopy}><small>Transactions</small><strong>{histories?.length || 0}</strong></span><span className="material-icons">arrow_forward</span></button>
                        <button type="button" className={styles.metricCard} onClick={() => menuHandler('card')}><span className={`${styles.metricIcon} ${styles.metricCardBlue}`}><span className="material-icons">credit_card</span></span><span className={styles.metricCopy}><small>Cards</small><strong>{cards?.length || 0}</strong></span><span className="material-icons">arrow_forward</span></button>
                        <button type="button" className={styles.metricCard} onClick={() => menuHandler('loan')}><span className={`${styles.metricIcon} ${styles.metricCardGold}`}><span className="material-icons">account_balance_wallet</span></span><span className={styles.metricCopy}><small>Loans</small><strong>{loans?.length || 0}</strong></span><span className="material-icons">arrow_forward</span></button>
                    </section>

                    {cards?.length > 0 && <section className={styles.cardsSection}><div className={styles.sectionHeading}><div><h2>Your cards</h2><p>Cards connected to your account</p></div><button type="button" onClick={() => menuHandler('card')}>View cards <span>→</span></button></div><div className={styles.bankCardGrid}>{cards.map(data=><article className={styles.bankCardItem} key={data._id}><div className={styles.creditCardWrap}><Cards number={data.cardNumber} expiry={data.expiry} cvc={data.cvv} name={`${user.firstName} ${user.lastName}`} className={styles.card} /></div><div className={styles.cardBalance}><span>Card balance</span><strong>${Intl.NumberFormat().format(data.Balance || 0)}</strong></div></article>)}</div></section>}

                    <section className={styles.lowerGrid}>
                        <div className={styles.transactionSection}><div className={styles.sectionHeading}><div><h2>Recent transactions</h2><p>Your latest account activity</p></div><div className={styles.transactionControls}><button type="button" aria-label="Sort newest first" className={!isReverse ? styles.activeSort : ''} onClick={rereverseHandler}><span className="material-icons">arrow_upward</span></button><button type="button" aria-label="Sort oldest first" className={isReverse ? styles.activeSort : ''} onClick={reverseHandler}><span className="material-icons">arrow_downward</span></button><button type="button" className={styles.viewAll} onClick={() => menuHandler('transaction-history')}>View all</button></div></div>
                            <div className={styles.tableWrap}><table className={styles.transactionTable}><thead><tr><th>Status</th><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead><tbody>{isDeposits?.length ? isDeposits.map(data=><tr key={data._id || `${data.date}-${data.amount}-${data.reason}`}><td><span className={styles.statusBadge}><i style={{backgroundColor:data.status === 'active' ? '#43a47c' : '#c5a05b'}} />{data.status === 'active' ? 'Complete' : 'Pending'}</span></td><td>{data.date?.substring(0,10) || '—'}</td><td>{data.reason || 'Transaction'}</td><td>{data.transactionType || '—'}</td><td className={styles.transactionAmount} style={{color:colorFun(data.transactionType)}}>${Intl.NumberFormat().format(data.amount || 0)}.00</td></tr>) : <tr><td colSpan="5" className={styles.emptyTable}>No recent transactions to show.</td></tr>}</tbody></table></div>
                        </div>
                        <aside className={styles.profileCard}><div className={styles.profileCardHead}><h2>Account profile</h2><button type="button" onClick={() => menuHandler('profile')}>Edit</button></div><div className={styles.profileAvatar}>{user?.passportUrl ? <img src={user.passportUrl} alt="Account profile" /> : <span className="material-icons">person</span>}</div><strong className={styles.profileName}>{user?.firstName || ''} {user?.lastName || ''}</strong><span className={styles.profileEmail}>{user?.email || ''}</span><div className={styles.profileDetails}><div><span>Country</span><strong>{user?.country || '—'}</strong></div><div><span>Account status</span><strong className={styles.accountActive}>{user?.accountVerified === false ? 'Inactive' : 'Active'}</strong></div></div><button type="button" className={styles.profileButton} onClick={() => menuHandler('profile')}>View profile</button></aside>
                    </section>
                </main>
            </div>
        </div>
        <Tab />
    </>);

}


export default Dashboard