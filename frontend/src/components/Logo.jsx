import logo from "../assets/branding/logo.png";

const Logo = ({ size = "h-10" }) => {
  return (
    <img
      src={logo}
      alt="FitTune Logo"
      className={`${size} w-auto`}
    />
  );
};

export default Logo;