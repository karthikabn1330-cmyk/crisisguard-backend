import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true }, // Hashed password
  address: { type: String },
  currentLocation: { type: String },
  
  // Track SOS usage
  sosClickCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
