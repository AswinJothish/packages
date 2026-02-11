export const generateRandomOrderId = () => {
  let prefix = "#";
  let numbers =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return prefix + text;
};

export const formatTime = (time: Date) => {
  return time
    .toLocaleDateString(undefined, {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    .replace("AM", "am")
    .replace("PM", "pm");
};
