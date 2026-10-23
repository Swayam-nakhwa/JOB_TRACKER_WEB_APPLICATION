import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    CompanyName: {
      type: String,
      required: true,
      trim: true,
    },
    JobRole: {
      type: String,
      required: true,
      trim: true,
    },
    JobUrl: {
      type: String,
      default: '',
      trim: true,
    },
    Status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  },
  {
    timestamps: true,
  }
)

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema)
