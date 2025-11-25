import React,{useContext, useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData } from "../../utils/api";

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

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [formFields, setFormsFields] = useState({
    email:'',
    password:''
  });

  const context  = useContext(MyContext);
  const history = useNavigate();

 
  useEffect(()=>{
    window.scrollTo(0,0)
    const token = localStorage.getItem('accessToken');

    if (token !== undefined && token !== null && token !== "") {
      history("/")
    }

  },[]);

  const forgotPassword =()=>{
  
          if(formFields.email===""){
            context.alertBox("error", "Please enter email id");
            return false;
          }
          else{
            context.alertBox("success", `OTP send to ${formFields.email}`);
            localStorage.setItem("userEmail", formFields.email);
            localStorage.setItem("actionType", 'forgot-password');

            postData("/api/user/forgot-password", {
              email: formFields.email,
            }).then((res) => {
              if (res?.error === false) {
                context.alertBox("success", res?.message);
                history("/verify")
              } else {
                context.alertBox("error", res?.message);
              }
            })


          }
    
  }

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(() => {
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
  
      if (formFields.email === "") {
        context.alertBox("error", "Please enter email id");
        return false
      }
  
  
      if (formFields.password === "") {
        context.alertBox("error", "Please enter password");
        return false
      }
  
  
      postData("/api/user/login", formFields, { withCredentials: true }).then((res) => {
        console.log(res)
  
        if (res?.error !== true) {
          setIsLoading(false);
          context.alertBox("success", res?.message);
          setFormsFields({
            email: "",
            password: ""
          })

          localStorage.setItem("accessToken",res?.data?.accesstoken);
          localStorage.setItem("refreshToken",res?.data?.refreshToken);

          context.setIsLogin(true);
  
          history("/")
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
            context.alertBox("success", res?.message || "Login successful");
            localStorage.setItem("userEmail", fields.email);
            localStorage.setItem("accessToken", res?.data?.accesstoken);
            localStorage.setItem("refreshToken", res?.data?.refreshToken);
    
            context.setIsLogin(true);
    
            history("/");
          } else {
            setIsLoading(false);
            context.alertBox("error", res?.message || "Login failed. Please try again.");
          }
        } catch (error) {
          // Handle Errors here.
          setIsLoading(false);
          const errorCode = error.code;
          const errorMessage = error.message;
          
          console.error("Google login error - Code:", errorCode, "Message:", errorMessage, "Full error:", error);
          
          // Show user-friendly error messages
          if (errorCode === "auth/popup-closed-by-user") {
            context.alertBox("error", "Login cancelled. Please try again.");
          } else if (errorCode === "auth/popup-blocked") {
            context.alertBox("error", "Popup blocked. Please allow popups for this site.");
          } else if (errorCode === "auth/network-request-failed") {
            context.alertBox("error", "Network error. Please check your connection.");
          } else if (errorCode === "auth/unauthorized-domain") {
            context.alertBox("error", "This domain is not authorized for Google login. Please contact support or add this domain to Firebase authorized domains.");
            console.error("Domain authorization error. Make sure your Vercel domain is added to Firebase Console → Authentication → Settings → Authorized domains");
          } else if (errorCode === "auth/operation-not-allowed") {
            context.alertBox("error", "Google sign-in is not enabled. Please contact support.");
          } else {
            context.alertBox("error", errorMessage || "Failed to login with Google. Please try again.");
          }
        }
      }
    

  return (
    <section className="section py-5 sm:py-10">
      <div className="container">
        <div className="card shadow-md w-full sm:w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <h3 className="text-center text-[18px] text-black">
            Login to your account
          </h3>

          <form className="w-full mt-5"  onSubmit={handleSubmit}>
            <div className="form-group w-full mb-5">
              <TextField
                type="emai"
                id="email"
                name="email"
                value={formFields.email}
                disabled={isLoading === true ? true : false}
                label="Email Id"
                variant="outlined"
                className="w-full"
                onChange={onChangeInput}
              />
            </div>

            <div className="form-group w-full mb-5 relative">
              <TextField
                type={isPasswordShow===false ? 'password' : 'text'}
                id="password"
                label="Password"
                variant="outlined"
                className="w-full"
                name="password"
                value={formFields.password}
                disabled={isLoading === true ? true : false}
                onChange={onChangeInput}
              />
              <Button className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black" onClick={()=>{
                setIsPasswordShow(!isPasswordShow)
              }}>
              {
                isPasswordShow===false ? <IoMdEye className="text-[20px] opacity-75"/> :
                <IoMdEyeOff className="text-[20px] opacity-75"/>
              }
              </Button>
            </div>


            <a className="link cursor-pointer text-[14px] font-[600]" onClick={forgotPassword}>Forgot Password?</a>

            <div className="flex items-center w-full mt-3 mb-3">
            <Button type="submit" disabled={!valideValue} className="btn-org btn-lg w-full flex gap-3">
              {
                isLoading === true ? <CircularProgress color="inherit" />
                  :
                  'Login'
              }

            </Button>
          </div>

            <p className="text-center">Not Registered? <Link className="link text-[14px] font-[600] text-primary" to="/register"> Sign Up</Link></p>


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
                  Logging in...
                </>
              ) : (
                <>
                  <FcGoogle className="text-[20px]"/> Login with Google
                </>
              )}
            </Button>

          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
