export const SIGNUP_USER = "SIGNUP_USER";
export const LOGIN_USER = "LOGIN_USER";
export const MODIFY_USER = "MODIFY_USER";
export const FETCH_ACCOUNTS = 'FETCH_ACCOUNTS'
export const WITHDRAW = 'WITHDRAW'
export const CARDS = 'CARDS'
export const DATA = 'DATA'

export const FETCH_ADMIN = 'FETCH_ADMIN '


//pure functions to calculate the time remaining

let calculateRemainingTime = (expiryDate) => {
  //getting current time in milliseconds
  const currentTime = new Date().getMilliseconds()
  //getting expiration time in milliseconds
  const adjustExpirationTime = (expiryDate * 60 * 60 * 1000)
  const timeLeft = adjustExpirationTime - currentTime
  return timeLeft
}


let retrievedAdminStoredToken = () => {
  let tokenFromStorage = localStorage.getItem('admin_token')
  let expiryDate = localStorage.getItem('admin_expiry')
  const timeLeft = calculateRemainingTime(expiryDate)

  if (timeLeft <= 3600) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_expiry')
    localStorage.removeItem('admin')

    return {
      adminToken: "",
      adminExpiresIn: ""
    }
  }

  return {
    adminToken: tokenFromStorage,
    adminExpiresIn: timeLeft
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const requestIdentityUploadUrl = (data) => {
  return async (dispatch, getState) => {
    const { userToken } = getState().userAuth || {};
    if (!userToken) return { bool: false, message: "Your session has expired. Please log in again." };

    // Render can take time to wake up. Give URL preparation its own timeout and
    // retry transient network/server responses instead of failing immediately.
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      try {
        const response = await fetch(`https://zentrixx-backend.onrender.com/identity-upload-url/${encodeURIComponent(userToken)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", header: userToken },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok) {
          const payload = result.response && typeof result.response === "object" ? result.response : result;
          if (!payload.uploadUrl || !payload.fileUrl) return { bool: false, message: "The upload service returned an incomplete response. Please retry." };
          return { bool: true, message: payload };
        }
        const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        if (!retryable || attempt === 2) {
          return { bool: false, message: result.response || result.message || `Upload preparation failed (${response.status}).` };
        }
      } catch (error) {
        if (attempt === 2) {
          return { bool: false, message: error.name === "AbortError" ? "The upload service took too long to respond. Please retry." : "Network error requesting upload URL. Please check your connection and retry." };
        }
      } finally {
        clearTimeout(timeout);
      }
      await sleep(500 * (attempt + 1));
    }
    return { bool: false, message: "Unable to prepare upload after retries. Please try again." };
  };
};

// Secure direct-to-S3 upload: no AWS credentials are exposed to the browser.
export const uploadIdentityFile = (file, documentType) => async (dispatch) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;
  if (!file || !allowed.includes(file.type)) return { bool: false, message: "Choose a JPG, PNG or WEBP image." };
  if (file.size <= 0 || file.size > maxSize) return { bool: false, message: "Image must be between 1 byte and 5 MB." };
  if (!["identity", "profile"].includes(documentType)) return { bool: false, message: "Invalid upload type." };

  for (let attempt = 0; attempt < 3; attempt++) {
    const signed = await dispatch(requestIdentityUploadUrl({ contentType: file.type, documentType, fileSize: file.size }));
    if (!signed.bool) return signed;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(signed.message.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
        signal: controller.signal,
      });
      if (response.ok) return { bool: true, fileUrl: signed.message.fileUrl, key: signed.message.key };

      const errorBody = await response.text().catch(() => "");
      const detail = errorBody.match(/<Message>(.*?)<\/Message>/i)?.[1] || errorBody.match(/<Code>(.*?)<\/Code>/i)?.[1];
      // A new signed URL is useful for transient failures. Avoid retrying most
      // client-side rejections, which require configuration or input changes.
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      if (!retryable || attempt === 2) {
        return { bool: false, message: detail ? `S3 upload rejected: ${detail}` : `Image upload failed (${response.status}). Please retry.` };
      }
    } catch (error) {
      if (attempt === 2) return { bool: false, message: error.name === "AbortError" ? "Image upload timed out. Try a smaller image or a better connection." : "Network connection interrupted during image upload. Please retry." };
    } finally {
      clearTimeout(timeout);
    }
    await sleep(500 * (attempt + 1));
  }
  return { bool: false, message: "Image upload failed after retries. Please try again." };
};

/*   user sections */
//https://zentrixx-backend.onrender.com
export const signup = (data) => {
  return async (dispatch) => {
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          bool: false,
          message: result.response || result.message || "Unable to create your account. Please check your details.",
          url: "/signup"
        };
      }

      const payload = {
        user: result.user,
        userToken: result.userToken,
        userExpiresIn: result.userExpiresIn,
        accounts: [],
        cards: [],
        loans: [],
        histories: []
      };

      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("user_token", JSON.stringify(result.userToken));
      localStorage.setItem("user_expiry", JSON.stringify(result.userExpiresIn));
      dispatch({ type: LOGIN_USER, payload });

      return {
        bool: true,
        message: result.response || "Account created successfully.",
        url: "/dashboard"
      };
    } catch (error) {
      return {
        bool: false,
        message: "Network error. Please check your connection and try again.",
        url: "/signup"
      };
    }
  };
};

export const login = (data) => {
  return async (dispatch, getState) => {
    let userData = data
    //do some check on the server if its actually login before proceding to dispatch
    try {
      const response = await fetch('https://zentrixx-backend.onrender.com/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: "/login"
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: "/login"
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        localStorage.setItem("user", JSON.stringify(data.response.user))

        localStorage.setItem("user_token", JSON.stringify(data.response.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.response.userExpiresIn))

        dispatch({ type: LOGIN_USER, payload: data.response })
        return {
          bool: true,
          //data here refers to user and dispatch
          message: data.response.message,
          url: `/verify/${userData.email}`
        }
      }
      if (response.status === 201) {
        let data = await response.json()

        localStorage.setItem("user", JSON.stringify(data.response.user))

        localStorage.setItem("user_token", JSON.stringify(data.response.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.response.userExpiresIn))


        dispatch({ type: LOGIN_USER, payload: data.response })
        return {
          bool: true,
          //data here refers to user and dispatch
          message: data.response.message,
          url: "/phonesignup"
        }
      }

      if (response.status === 202) {
        let data = await response.json()
        //saving data to local storage
        localStorage.setItem("user", JSON.stringify(data.response.user))

        localStorage.setItem("user_token", JSON.stringify(data.response.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.response.userExpiresIn))


        dispatch({ type: LOGIN_USER, payload: data.response })

        return {
          bool: true,
          //data here refers to user and dispatch
          message: data.response.message,
          url: "/registeration"
        }
      }
      if (response.status === 203) {
        let data = await response.json()
        //saving data to local storage
        localStorage.setItem("user", JSON.stringify(data.response.user))

        localStorage.setItem("user_token", JSON.stringify(data.response.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.response.userExpiresIn))


        dispatch({ type: LOGIN_USER, payload: data.response })

        return {
          bool: true,
          //data here refers to user and dispatch
          message: data.response.message,
          url: "/profilephoto"
        }
      }
      if (response.status === 206) {

        let data = await response.json()
        //saving data to local storage
        localStorage.setItem("user", JSON.stringify(data.response.user))

        localStorage.setItem("user_token", JSON.stringify(data.response.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.response.userExpiresIn))
        dispatch({ type: LOGIN_USER, payload: data.response })

        return {
          bool: true,
          //data here refers to user and dispatch
          message: data.response.message,
          url: "/dashboard"
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

/*
export const verifiedEmail = (data) => {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/emailverify`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 200) {
        
        let data = await response.json()
        //save to async storage and reducer store

        localStorage.setItem("user", JSON.stringify(data.user))

        localStorage.setItem("user_token", JSON.stringify(data.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.userExpiresIn))

        let payloadData = {
          user:data.user,
          userToken:data.userToken,
          userExpiresIn:data.userExpiresIn

        }


        dispatch({ type: LOGIN_USER, payload: payloadData })

        return {
          bool: true,
          message: data.response
        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}
*/

//https://zentrixx-backend.onrender.com.com

//this one is the email verification page after signin up
export const checkverification = (email) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/checkverification/${email}`, {
        headers: {
          "Content-Type": "application/json",
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //save to async storage and reducer store

        localStorage.setItem("user", JSON.stringify(data.user))

        localStorage.setItem("user_token", JSON.stringify(data.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.userExpiresIn))

        let payloadData = {
          user: data.user,
          userToken: data.userToken,
          userExpiresIn: data.userExpiresIn

        }
        dispatch({ type: LOGIN_USER, payload: payloadData })


        return {
          bool: true,
          message: data.response,
          url: 'phonesignup'
        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

//this function is the verification client continually undergo from email
export const verifying = (token) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/verifying/${token}`, {
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        //save to async storage and reducer store

        localStorage.setItem("user", JSON.stringify(data.user))

        localStorage.setItem("user_token", JSON.stringify(data.userToken))

        localStorage.setItem("user_expiry", JSON.stringify(data.userExpiresIn))

        let payloadData = {
          user: data.user,
          userToken: data.userToken,
          userExpiresIn: data.userExpiresIn

        }


        dispatch({ type: LOGIN_USER, payload: payloadData })

        return {
          bool: true,
          message: data.response,
          url: 'phonesignup'
        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const sendRecoverEmail = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/recoverpassword`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,

        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,

        }
      }
      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,

        }
      }
      if (response.status === 200) {
        let data = await response.json()

        return {
          bool: true,
          message: data.response,

        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const checkRecoverTokenValidity = (token) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/checkrecovertokenvalidity/${token}`, {
        headers: {
          "Content-Type": "application/json",
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const changePassword = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      const response = await fetch(`https://zentrixx-backend.onrender.com/changepassword/${data.token}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const phoneSignup = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth


      const response = await fetch(`https://zentrixx-backend.onrender.com/phonesignup/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: '/phonesignup'
        }
      }


      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: '/phonesignup'
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        return {
          bool: true,
          message: data.response,
          url: '/registeration'
        }
      }
    } catch (err) {

      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const verifyPhone = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      console.log(userToken)

      const response = await fetch(`https://zentrixx-backend.onrender.com/verifyphone/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'phoneverification'
        }
      }


      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'phoneverification'
        }
      }


      if (response.status === 200) {
        let data = await response.json()
        return {
          bool: true,
          message: data.response,
          url: 'registeration'
        }
      }

    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const registeration = (data) => {
  return async (dispatch, getState) => {
    try {
      const { userToken } = getState().userAuth;
      const response = await fetch(`https://zentrixx-backend.onrender.com/registeration/${userToken}`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { bool: false, message: result.response || "Could not save your identity document." };
      }
      return { bool: true, message: result.response || "Identity document saved." };
    } catch (error) {
      return { bool: false, message: "Network error while saving your identity document." };
    }
  };
};

export const profilePhoto = (data) => {
  return async (dispatch, getState) => {
    try {
      const { userToken } = getState().userAuth;
      const response = await fetch(`https://zentrixx-backend.onrender.com/pofilephoto/${userToken}`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { bool: false, message: result.response || "Could not save your profile photo." };
      }
      return { bool: true, message: result.response || "Profile photo saved." };
    } catch (error) {
      return { bool: false, message: "Network error while saving your profile photo." };
    }
  };
};

/*  Dashboard Routes  */

//get user



export const hasCardFun = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      //https://zentrixx-backend.onrenderxxx.com

      const response = await fetch(`https://zentrixx-backend.onrender.com/hascard/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,

        }
      }


      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }


      if (response.status === 200) {
        let data = await response.json()
        //fetch cards to store
        dispatch({ type: CARDS, payload: data.response })

        return {
          bool: true,
          message: data.response,
        }
      }

    } catch (err) {
      console.log(err)
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const createCard = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/createcard/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data),
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,

        }
      }


      if (response.status === 200) {
        let data = await response.json()

        //dispatch a new user
        dispatch({ type: MODIFY_USER, payload: data.response })

        return {
          bool: true,
          message: data.response.cards,
        }
      }

    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const deleteCard = (id) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/deletecard/${userToken}/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user

        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: true,
          message: data.response.user,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const fetchDeposits = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/withdraws/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const createDeposits = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/deposits/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}


export const withdraws = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/withdraw/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: "withdraw"
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: "withdraw"
        }
      }
      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: "tax"
        }
      }
      if (response.status === 302) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: "bsa"
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        //dispatch new history and account
        dispatch({ type: WITHDRAW, payload: data.response.allAccount })

        return {
          bool: true,
          message: data.response.savedHistory,
          url: 'withdraw'
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const fetchWithdraw = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/withdraws/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}


export const fetchAccounts = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth
      const response = await fetch(`https://zentrixx-backend.onrender.com/accounts/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        //dispatch a new user
        //FETCH_ACCOUNTS
        dispatch({ type: FETCH_ACCOUNTS, payload: data.response })

        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}


export const submitTaxCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken,
        paymentData
      } = getState().userAuth

      data.payment = paymentData

      const response = await fetch(`https://zentrixx-backend.onrender.com/tax/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })

      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tax'
        }
      }
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tax'
        }
      }

      if (response.status === 302) {
        let data = await response.json()

        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'bsa'
        }
      }

      if (response.status === 303) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tac'
        }
      }
      if (response.status === 305) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'nrc'
        }
      }

      if (response.status === 306) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'imf'
        }
      }

      if (response.status === 307) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'cot'
        }
      }


      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })
        //dispatch a new user
        return {
          bool: true,
          url: 'transfer'
        }
      }

    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const submitBsaCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken,
        paymentData
      } = getState().userAuth
      data.payment = paymentData

      const response = await fetch(`https://zentrixx-backend.onrender.com/bsa/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'bsa'
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'bsa'
        }
      }

     
      if (response.status === 301) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tax'
        }
      }

     
      if (response.status === 303) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tac'
        }
      }
      if (response.status === 305) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })

        return {
          bool: false,
          message: data.response.message,
          url: 'nrc'
        }
      }

      if (response.status === 306) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'imf'
        }
      }

      if (response.status === 307) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'cot'
        }
      }


      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })
        //dispatch a new user
        return {
          bool: true,
          //message: data.response,
          url: 'transfer'
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}
export const submitTacCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken,
        paymentData
      } = getState().userAuth
      data.payment = paymentData

      const response = await fetch(`https://zentrixx-backend.onrender.com/tac/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tac'
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tac'
        }
      }
    
     
      if (response.status === 301) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tax'
        }
      }

      if (response.status === 302) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'bsa'
        }
      }

      if (response.status === 305) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'nrc'
        }
      }

      if (response.status === 306) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'imf'
        }
      }

      if (response.status === 307) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'cot'
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })
        //dispatch a new user
        return {
          bool: true,
          //message: data.response,
          url: 'transfer'
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}
export const submitNrcCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken,
        paymentData
      } = getState().userAuth
      data.payment = paymentData

      const response = await fetch(`https://zentrixx-backend.onrender.com/nrc/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'nrc'
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'nrc'
        }
      }
      
     
      if (response.status === 301) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tax'
        }
      }

      if (response.status === 302) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'bsa'
        }
      }

      if (response.status === 303) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tac'
        }
      }
  
      if (response.status === 306) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'imf'
        }
      }

      if (response.status === 307) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'cot'
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })
        //dispatch a new user
        return {
          bool: true,
          //message: data.response,
          url: 'transfer'
        }
      }

    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}
export const submitImfCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken,
        paymentData
      } = getState().userAuth
      data.payment = paymentData

      const response = await fetch(`https://zentrixx-backend.onrender.com/imf/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'imf'
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'imf'
        }
      }

     
      if (response.status === 301) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tax'
        }
      }

      if (response.status === 302) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })

        return {
          bool: false,
          message: data.response.message,
          url: 'bsa'
        }
      }

      if (response.status === 303) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tac'
        }
      }
      if (response.status === 305) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'nrc'
        }
      }

     

      if (response.status === 307) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'cot'
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })
        //dispatch a new user
        return {
          bool: true,
          //message: data.response,
          url: 'transfer'
        }
      }
     
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

//https://back-end-n.onrender.com

export const submitCotCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {

      let {
        userToken,
        paymentData
      } = getState().userAuth

      data.payment = paymentData

      const response = await fetch(`https://zentrixx-backend.onrender.com/cot/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })



      if (response.status === 404) {
        let data = await response.json()


        return {
          bool: false,
          message: data.response,
          url: 'cot'
        
        }
      }

      if (response.status === 300) {
        let data = await response.json()


        return {
          bool: false,
          message: data.response,
          url: 'cot'
        }
      }
     
      if (response.status === 301) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tax'
        }
      }

      if (response.status === 302) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'bsa'
        }
      }

      if (response.status === 303) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'tac'
        }
      }
      if (response.status === 305) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'nrc'
        }
      }

      if (response.status === 306) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })


        return {
          bool: false,
          message: data.response.message,
          url: 'imf'
        }
      }


      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: MODIFY_USER, payload: data.response })
        //dispatch a new user
        return {
          bool: true,
          //message: data.response,
          url: 'transfer'
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}


export const sendAccount = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      dispatch({ type: DATA, payload: { ...data, url: 'sendAccount' } })

      const response = await fetch(`https://zentrixx-backend.onrender.com/sendAccount/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: ''
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: ''
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tax'
        }
      }
      if (response.status === 302) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'bsa'
        }
      }
      if (response.status === 303) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tac'
        }
      }
      if (response.status === 305) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'nrc'
        }
      }
      if (response.status === 306) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'imf'
        }
      }
      if (response.status === 307) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'cot'
        }
      }



      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: WITHDRAW, payload: data.response.allAccount })
        //dispatch a new user
        return {
          bool: true,
          message: data.response.transfer,
          url: ''
        }
      }
    } catch (err) {
      console.log(err)
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const sendAccountWithinBank = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      dispatch({ type: DATA, payload: { ...data, url: 'sendAccountWithinBank' } })


      const response = await fetch(`https://zentrixx-backend.onrender.com/sendAccountWithinBank/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })




      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: ''
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: ''
        }
      }
      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tax'
        }
      }

      if (response.status === 302) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'bsa'
        }
      }
      if (response.status === 303) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'tac'
        }
      }

      if (response.status === 305) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'nrc'
        }
      }
      if (response.status === 306) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'imf'
        }
      }
      if (response.status === 307) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'cot'
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: WITHDRAW, payload: data.response.allAccount })
        //dispatch a new user
        return {
          bool: true,
          message: data.response.transfer,
          url: ''
        }
      }
    } catch (err) {
      console.log(err)
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const fetchTransfersAccount = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/transferstoaccount/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}


export const fetchAllAccount = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/allaccounts/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()

        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

//send otp code to the user
export const sendOtpCode = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/otpcode/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

//submit otp code to server
export const submitOtpCode = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/otpcode/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        dispatch({ type: MODIFY_USER, payload: data.response })
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

//fetchin all beneficiaries 
export const fetchAllBenefeciaries = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/beneficiaries/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const addBeneficiaries = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/beneficiaries/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'add-beneficiaries'
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: 'add-beneficiaries'
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
          url: 'beneficiaries'
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const deleteBeneficiaries = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/beneficiaries/${userToken}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify({ id: data })
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}
// fetch notifications
export const fetchAllNotifications = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/notifications/${userToken}`, {
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}
//delete notifications
export const deleteNotification = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/notifications/${userToken}/${data._id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      alert('was called')
      console.log(err)
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}

export const applyLoan = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/loan/${userToken}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a new user
        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}




export const fetchAdmin = () => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/admin`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        }
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
        //dispatch a admin to store
        dispatch({ type: FETCH_ADMIN, payload: data.response })

        return {
          bool: true,
          message: data.response,
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}


//method to send email from contact message
export const sendContactEmail = (data) => {
  return async (dispatch, getState) => {
    //do some check on the server if its actually login before proceding to dispatch
    try {
      let {
        userToken
      } = getState().userAuth

      const response = await fetch(`https://zentrixx-backend.onrender.com/contact`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "header": `${userToken}`
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 200) {
        let data = await response.json()
    
        return {
          bool: true,
          message: data.response
        }
      }
    } catch (err) {
      return {
        bool: false,
        message: "network error"
      }
    }
  }
}










