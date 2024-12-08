import './global.css';

export const metadata = {
  title: "Cricket GPT",
  description: "The place to go for all your cricket questions!"
};


const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
