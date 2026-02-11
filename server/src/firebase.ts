import admin from "firebase-admin";
import serviceAccount from "./lib/firebase-config.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;

async function sendNotification(token, title, body) {
  const message = {
    notification: {
      title: title,
      body: body
    },
    token: token, // The device token that will receive the notification
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.log('Error sending message:', error);
  }
}