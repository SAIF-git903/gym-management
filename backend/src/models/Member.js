import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, default: '', trim: true },
    /** Internal notes for the gym owner (not shown to members). */
    notes: { type: String, default: '', trim: true, maxlength: 5000 },
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
  // createdAt / updatedAt from timestamps (matches required createdAt field)
  { timestamps: true }
);

memberSchema.index({ email: 1 });

export const Member = mongoose.model('Member', memberSchema);
