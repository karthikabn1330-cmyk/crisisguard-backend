import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authority', required: true },
  
  type: { type: String, required: true }, // e.g. "Emergency"
  description: { type: String },
  location: { type: String, required: true },
  severity: { type: String, enum: ['MEDIUM', 'HIGH', 'CRITICAL'] },
  
  status: { type: String, enum: ['PENDING', 'STAFF_ASSIGNED', 'RESOLVED', 'CANCELLED'], default: 'PENDING' },
  
  assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date } // Used to calculate time difference for volunteer metrics
});

export default mongoose.model('Alert', AlertSchema);
