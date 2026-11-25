import React, { useEffect, useState } from 'react';
import styles from './Home.module.css'
import { useDispatch } from 'react-redux';
import { fetchAdmin } from '../store/action/userAppStorage';



const AboutPage = () => {
    let [isLoading, setIsLoading] = useState(true)
    let [isShow, setIsShow] = useState(false)
    let dispatch = useDispatch()
    let [isAdminData, setIsAdminData] = useState({})



    


    let load = async () => {
        //fetch admin details
        let res = await dispatch(fetchAdmin())
        if (!res.bool) {
            return setIsLoading(false)
        }
        setIsAdminData(res.message)
        return setIsLoading(false)
    }

    let loader = async () => {
        return setIsLoading(false)
    }

    useEffect(() => {
        load()
        setTimeout(() => {
            loader()
        }, 3000);
        
        
    }, [])



  

    let togglemenu = () => {
        setIsShow(prev => !prev)
    }



    return (<>
    {isLoading ? <div className="preloader">
            <div className="loader">
                <div className="shadow"></div>
                <div className="box"></div>
            </div>
        </div> : ""}


        <div className="navbar-area">
            <div className="luvion-responsive-nav">
                <div className="container">
                    <div className="luvion-responsive-menu">
                        <div className="logo">
                            <a href="/">
                                <img src="front/img/favicon.png" alt="logo" />
                                <img src="front/img/favicon.png" alt="logo" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="luvion-nav">
                <div className="container">
                    <nav className="navbar navbar-expand-md navbar-light">
                        <a className="navbar-brand" href="/">
                            <img src="front/img/favicon.png" alt="logo" />
                            <img src="front/img/favicon.png" alt="logo" />
                        </a>

                        <div className="collapse navbar-collapse mean-menu" id="navbarSupportedContent">
                            <ul className="navbar-nav">
                                <li className="nav-item"><a href="/" className="nav-link active">HOME</a></li>

                                <li className="nav-item"><a href="#" className="nav-link">PERSONAL </a>
                                    <ul className="dropdown-menu">
                                        <li className="nav-item"><a href="/savings" className="nav-link">SAVINGS ACCOUNT</a></li>

                                        <li className="nav-item"><a href="/current" className="nav-link">CURRENT ACCOUNT</a></li>
                                    </ul>
                                </li>

                                <li className="nav-item"><a href="/about" className="nav-link">ABOUT US</a></li>



                                <li className="nav-item"><a href="/cards" className="nav-link">CARDS</a></li>


                                <li className="nav-item"><a href="/faq" className="nav-link">FAQ</a></li>

                                <li className="nav-item"><a href="/contact" className="nav-link">CONTACT</a></li>
                            </ul>

                            <div className="others-options">
                                <a href="/login" target="_blank" className="login-btn">
                                    <strong><i className="flaticon-user"></i> ONLINE BANKING</strong></a>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            <button type="button" className="visitor-menu-toggle" onClick={togglemenu} aria-label={isShow ? "Close navigation" : "Open navigation"} aria-expanded={isShow}>
                <i className="fas fa-bars" aria-hidden="true"></i>
            </button>


            <div className={`visitor-mobile-menu ${isShow ? "is-open" : ""}`}>
                <ul className={styles.listcontainer}>
                    <li className={styles.listitem}><a href="/" >HOME</a></li>

                    <li className={styles.listitemexpand}><a href="/savings" >SAVINGS ACCOUNT</a>

                    </li>
                    <li className={styles.listitemexpand}><a href="/current" >CURRENT ACCOUNT </a>

                    </li>

                    <li className={styles.listitem}><a href="/about" >ABOUT US</a></li>



                    <li className={styles.listitem}><a href="/cards" >CARDS</a></li>




                    <li className={styles.listitem}><a href="/contact" >CONTACT</a></li>
                    <li className={styles.listitemlast}><a href="/login" >LOGIN</a><a href="/signup" >SIGNUP</a></li>
                </ul>


            </div>
        </div>


        <div className="page-title-area item-bg1 jarallax" data-jarallax='{"speed": 0.3}'>
            <div className="container">
                <div className="page-title-content">
                    <h2>About Us</h2>
                    <p>Learn how we are focused on being flexible, resilient and responsible. </p>
                </div>
            </div>
        </div>


        <section className="about-area ptb-70">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-12">
                        <div className="about-content">
                            <span>How we were founded</span>
                            <h2>A clearer, more confident way to bank</h2>
                            <p>Zentrixx Bank is built around a simple idea: everyday banking should be clear, accessible and designed around the people who use it. We bring essential money tools into one convenient digital experience, helping customers manage their finances with greater confidence.</p>

                            <p>From managing day-to-day payments to building savings habits, our focus is on making the important parts of banking feel straightforward, dependable and easy to access.</p>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12">
                        <div className="about-image">
                            <img src="front/img/about-img1.jpg" alt="image" />
                        </div>
                    </div>
                </div>
            </div>
        </section>







        <section class="funfacts-area ptb-70 pt-0">
            <div class="container">


                <p>Zentrixx Bank provides digital banking services designed to make everyday money management simpler. Product availability and terms may vary.
                </p>

                <p>
                    Equal Housing Opportunity
                </p>


                <p>
                    Investing involves market  risk, including possible loss of principal, and there is no guarantee that investment objectives will be achieved.Past performance is not a guarantee of future results.
                </p>


                <p>

                    Zentrixx Bank is focused on convenient digital banking, helpful support, and giving customers tools to manage their money with confidence.


                </p>



                <p> INVESTMENT AND INSURANCE PRODUCTS ARE: </p>
                <p> --NOT FDIC INSURED</p>
                <p> --NOT INSURED BY ANY FEDERAL GOVERNMENT AGENCY</p>
                <p> --Investment products, if offered, are subject to risk and are not guaranteed by Zentrixx Bank</p>
                <p>--SUBJECT TO INVESTMENT RISKS, INCLUDING POSSIBLE LOSS OF THE PRINCIPAL AMOUNT INVESTED
                </p>

            </div>
        </section>




        <footer className="footer-area">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-sm-6 col-md-6">
                        <div className="single-footer-widget">
                            <div className="logo">
                                <a href="/" className="black-logo"><img src="front/img/favicon.png" alt="logo" /></a>

                                <p>Zentrixx is focused on practical digital banking, responsive customer support and a better everyday experience.</p>
                            </div>

                            <ul className="social-links">
                                <li><a href="#" target="_blank"><i className="fab fa-facebook-f"></i></a></li>
                                <li><a href="#" target="_blank"><i className="fab fa-twitter"></i></a></li>
                                <li><a href="#" target="_blank"><i className="fab fa-instagram"></i></a></li>
                                <li><a href="#" target="_blank"><i className="fab fa-linkedin-in"></i></a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-3 col-sm-6 col-md-6">
                        <div className="single-footer-widget">
                            <h3>Company</h3>

                            <ul className="list">
                                <li><a href="/about">About Us</a></li>
                                <li>
                                    <a href="/savings">Savings</a>
                                </li>
                                <li><a href="checking.html">Checking</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-3 col-sm-6 col-md-6">
                        <div className="single-footer-widget">
                            <h3>Support</h3>

                            <ul className="list">
                                <li><a href="/faq">FAQ's</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="/contact">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-3 col-sm-6 col-md-6">
                        <div className="single-footer-widget">
                            <h3>Address</h3>

                            <ul className="footer-contact-info">
                                <li><span>Location:</span> {isAdminData.location}</li>
                                <li><span>Phone:</span> <a href="">{isAdminData.phone}</a></li>
                                
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="copyright-area">
                    <p>Copyright
                        <script>
                            document.write(new Date().getFullYear())
                        </script> | <a href="/" target="_blank">Smarter Banking</a></p>
                </div>
            </div>


        </footer>

        <div className="go-top"><i className="fas fa-arrow-up"></i></div>





    </>)


}

export default AboutPage