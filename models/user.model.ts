import { IContact } from '@/types'
import { Schema, models, model } from 'mongoose'

const userSchema = new Schema<IContact>({
  email: { type: String, required: true, },
  verified: { type: Boolean, default: false },
  firstName: { type: String },
  lastName: { type: String },
  bio: { type: String },
  avatar: { type: String },
  muted: { type: Boolean, default: false },
  notificationSound: { type: String, default: 'notification.mp3' },
  sendingSound: { type: String, default: 'sending.mp3' },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

const User = models.User || model<IContact>('User', userSchema)
export default User
