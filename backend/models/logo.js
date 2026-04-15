import mongoose from "mongoose";

const LogoSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
    },
    company_logo: {
      type: String,
    },
  },
  { timestamps: true }
);

const Logo = mongoose.model("Logo", LogoSchema);

export default Logo;
