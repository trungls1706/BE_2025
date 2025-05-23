import { ObjectId } from 'mongodb';

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}

export interface LoginReqBody {
_id: ObjectId;
  name: string;
  email: string;
  date_of_birth: Date;
  password: string;
  created_at: Date;
  updated_at: Date;
  email_verify_token: string;
  forgot_password_token: string;
  verify: number;
  bio: string | null;
  location: string | null;
  website: string | null;
  username: string | null;
  avatar: string | null;
  cover_photo: string | null;
}
