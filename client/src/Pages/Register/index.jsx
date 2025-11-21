import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";

// Initialize auth only if Firebase app is available
let auth = null;
let googleProvider = null;

if (firebaseApp) {
  try {
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error);
  }
}

const Register = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    password: ""
  })

  const context = useContext(MyContext);
  const history = useNavigate();

    useEffect(()=>{
      window.scrollTo(0,0)
    },[])
  

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value
      }
    })
  }

  const valideValue = Object.values(formFields).every(el => el)

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.name === "") {
      context.alertBox("error", "Please enter full name");
      return false
    }

    if (formFields.email === "") {
      context.alertBox("error", "Please enter email id");
      return false
    }


    if (formFields.password === "") {
      context.alertBox("error", "Please enter password");
      return false
    }


    postData("/api/user/register", formFields).then((res) => {

      if (res?.error !== true) {
        setIsLoading(false);
        context.alertBox("success", res?.message);
        localStorage.setItem("userEmail", formFields.email)
        setFormFields({
          name: "",
          email: "",
          password: ""
        })

        history("/verify")
      } else {
        context.alertBox("error", res?.message);
        setIsLoading(false);
      }

    })


  }



  const authWithGoogle = async (e) => {
    // Prevent form submission if called from button click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Check if Firebase is properly initialized
      if (!firebaseApp) {
        console.error("Firebase app is not initialized. Check Firebase configuration.");
        context.alertBox("error", "Firebase is not properly configured. Please check your environment variables.");
        return;
      }
      
      if (!auth || !googleProvider) {
        console.error("Firebase Auth is not initialized. Auth:", auth, "Provider:", googleProvider);
        context.alertBox("error", "Firebase authentication is not properly configured. Please check your Firebase settings.");
        return;
      }
      
      setIsLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;

      const fields = {
        name: user.displayName || user.providerData[0]?.displayName || "User",
        email: user.email || user.providerData[0]?.email,
        password: null,
        avatar: user.photoURL || user.providerData[0]?.photoURL || "",
        mobile: user.phoneNumber || user.providerData[0]?.phoneNumber || "",
        role: "USER"
      };

      if (!fields.email) {
        setIsLoading(false);
        context.alertBox("error", "Failed to get email from Google account");
        return;
      }

      const res = await postData("/api/user/authWithGoogle", fields);

      if (res?.error !== true) {
        setIsLoading(false);
        context.alertBox("success", res?.message || "Registration successful");
        localStorage.setItem("userEmail", fields.email);
        localStorage.setItem("accessToken", res?.data?.accesstoken);
        localStorage.setItem("refreshToken", res?.data?.refreshToken);

        context.setIsLogin(true);

        history("/");
      } else {
        setIsLoading(false);
        context.alertBox("error", res?.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      // Handle Errors here.
      setIsLoading(false);
      const errorCode = error.code;
      const errorMessage = error.message;
      
      console.error("Google signup error - Code:", errorCode, "Message:", errorMessage, "Full error:", error);
      
      // Show user-friendly error messages
      if (errorCode === "auth/popup-closed-by-user") {
        context.alertBox("error", "Signup cancelled. Please try again.");
      } else if (errorCode === "auth/popup-blocked") {
        context.alertBox("error", "Popup blocked. Please allow popups for this site.");
      } else if (errorCode === "auth/network-request-failed") {
        context.alertBox("error", "Network error. Please check your connection.");
      } else if (errorCode === "auth/unauthorized-domain") {
        context.alertBox("error", "This domain is not authorized for Google signup. Please contact support or add this domain to Firebase authorized domains.");
        console.error("Domain authorization error. Make sure your Vercel domain is added to Firebase Console → Authentication → Settings → Authorized domains");
      } else if (errorCode === "auth/operation-not-allowed") {
        context.alertBox("error", "Google sign-in is not enabled. Please contact support.");
      } else {
        context.alertBox("error", errorMessage || "Failed to sign up with Google. Please try again.");
      }
    }
  }

  return (
    <section className="section py-5 sm:py-10">
      <div className="container">
        <div className="card shadow-md w-full sm:w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <h3 className="text-center text-[18px] text-black">
            Register with a new account
          </h3>

          <form className="w-full mt-5" onSubmit={handleSubmit}>
            <div className="form-group w-full mb-5">
              <TextField
                type="text"
                id="name"
                name="name"
                value={formFields.name}
                disabled={isLoading === true ? true : false}
                label="Full Name"
                variant="outlined"
                className="w-full"
                onChange={onChangeInput}
              />
            </div>


            <div className="form-group w-full mb-5">
              <TextField
                type="emai"
                id="email"
                name="email"
                label="Email Id"
                value={formFields.email}
                disabled={isLoading === true ? true : false}
                variant="outlined"
                className="w-full"
                onChange={onChangeInput}
              />
            </div>

            <div className="form-group w-full mb-5 relative">
              <TextField
                type={isPasswordShow === false ? 'password' : 'text'}
                id="password"
                name="password"
                label="Password"
                variant="outlined"
                className="w-full"
                value={formFields.password}
                disabled={isLoading === true ? true : false}
                onChange={onChangeInput}
              />
              <Button className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black" onClick={() => {
                setIsPasswordShow(!isPasswordShow)
              }}>
                {
                  isPasswordShow === false ? <IoMdEye className="text-[20px] opacity-75" /> :
                    <IoMdEyeOff className="text-[20px] opacity-75" />
                }
              </Button>
            </div>

            <div className="flex items-center w-full mt-3 mb-3">
              <Button type="submit" disabled={!valideValue} className="btn-org btn-lg w-full flex gap-3">
                {
                  isLoading === true ? <CircularProgress color="inherit" />
                    :
                    'Register'
                }

              </Button>
            </div>

            <p className="text-center">Already have an account? <Link className="link text-[14px] font-[600] text-primary" to="/login"> Login</Link></p>


            <p className="text-center font-[500]">Or continue with social account</p>

            <Button 
              type="button"
              className="flex gap-3 w-full !bg-[#f1f1f1] btn-lg !text-black"
              onClick={authWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Signing up...
                </>
              ) : (
                <>
                  <FcGoogle className="text-[20px]" /> Sign Up with Google
                </>
              )}
            </Button>

          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
