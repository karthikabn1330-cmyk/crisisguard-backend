import mongoose from 'mongoose';

const AuthoritySchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  orgType: { type: String, required: true, enum: ['Hospital', 'Hotel', 'Resort', 'Restaurant'] },
  inchargeName: { type: String, required: true },
  
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true }, 
  
  address: { type: String, required: true },
  status: { type: String, default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Authority', AuthoritySchema);
