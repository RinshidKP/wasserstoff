
import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: Number, default : 1111 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

export default User;

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};
