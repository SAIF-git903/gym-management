import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    address: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true, maxlength: 5000 },
    /** Fee for the current membership period (Pakistani Rupees). */
    membershipFee: { type: Number, default: 0, min: 0 },
    /** ABO/Rh, e.g. A+, O-; empty if unknown. */
    bloodGroup: { type: String, default: '', trim: true, maxlength: 5 },
    plan: {
      type: String,
      required: true,
      enum: ['monthly', 'quarterly', 'half-yearly', 'yearly'],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
)

memberSchema.index({ email: 1 })

export const Member = mongoose.models.Member || mongoose.model('Member', memberSchema)
