import mongoose from 'mongoose';

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true }, 
  
  address: { type: String },
  currentLocation: { type: String },
  
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authority', required: true },
  jobProfile: { type: String, required: true }, // e.g. "Medical Staff", "Security"

  // Performance & Tracking Metrics
  peopleHelped: { type: Number, default: 0 },
  totalResponseTimeMinutes: { type: Number, default: 0 }, // Sum of minutes taken to resolve issues
  
  // Calculated fields (can also be evaluated via virtuals or directly stored)
  estimatedPaycheck: { type: Number, default: 0 }, // E.g. base pay + (peopleHelped * bonus)
  
  createdAt: { type: Date, default: Date.now }
});

// Virtual for average response time efficiency
VolunteerSchema.virtual('averageResponseTime').get(function() {
  if (this.peopleHelped === 0) return 0;
  return this.totalResponseTimeMinutes / this.peopleHelped;
});

export default mongoose.model('Volunteer', VolunteerSchema);
