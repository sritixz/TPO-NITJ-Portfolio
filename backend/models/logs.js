import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  userType:{ type: String, default: null },
  url:{ type: String, default: null },
  method:{ type: String, default: null },
  deviceInfo:{
    browser: String,
    os: String,
    deviceType: String,
  },
  ip:{type: String},
  userAgent: {type: String},
}, {timestamps: true});

LogSchema.index({createdAt: 1 }, { expireAfterSeconds: 450000});

export default mongoose.model("Logs", LogSchema);
