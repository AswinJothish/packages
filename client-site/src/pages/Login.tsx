import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { baseUrl } from "../lib/config";

declare global {
  interface Window {
    //@ts-ignore
    otpless: (otplessUser: any) => void;
  }
}

const Login = () => {
  // Function to call backend API
  const loginWithBackend = async (mobileNumber: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber })
      });

      if (![200, 201].includes(response.status)) {
        console.error('Login failed: Invalid response status:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.ok) {
        localStorage.setItem('_id', data.userData._id);
        localStorage.setItem('userId', data.userData.userid);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('API call failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Authentication callback
    window.otpless = async (otplessUser) => {
      console.log("OTPless response:", otplessUser);
      console.log("status=", otplessUser.status);
      console.log("mobileNumber", otplessUser.identities[0].identityValue);

      // Check if the status is "SUCCESS"
      if (otplessUser.status !== "SUCCESS") {
        console.error("OTP verification failed or status not successful");
        alert("OTP verification failed. Please try again.");
        return;
      }

      // Get the mobile number from identityValue and remove the country code
      if (otplessUser.status === "SUCCESS") {
        const mobileNumber = otplessUser.identities[0].identityValue.replace('91', '');

        // Call backend API
        const loginSuccess = await loginWithBackend(mobileNumber);

        if (loginSuccess) {
          console.log("Login successful!");
          window.location.href = '/';
        } else {
          alert("Login failed. Please try again.");
        }
      } else {
        console.error("Mobile number not found in the response");
        alert("Login failed. Please try again.");
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          id="otpless-sdk"
          type="text/javascript"
          src="https://otpless.com/v3/auth.js"
          data-appid="szyon9i65puy9algfk58"
        />
      </Helmet>

      <div className="flex justify-center h-[100vh] w-full items-center">
        <div id="otpless-login-page"></div>
      </div>
    </>
  );
};

export default Login;