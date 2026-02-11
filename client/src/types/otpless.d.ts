// src/types/otpless.d.ts

interface OtplessUserData {
    token: string;
    email?: string;
    mobile?: string;
    // Add other user data fields as per your OTP-less configuration
  }
  
  interface OtplessSDK {
    init: (config: {
      apiKey: string;
      onSuccess: (userData: OtplessUserData) => void;
      onError: (error: any) => void;
    }) => void;
    login: () => void;
  }
  
  declare global {
    interface Window {
      otpless?: OtplessSDK;
    }
  }
  
  export {};