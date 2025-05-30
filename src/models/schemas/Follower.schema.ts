import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'

interface FolowerType {
  _id?: ObjectId
  user_id: ObjectId
  folower_user_id: ObjectId
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  folower_user_id: ObjectId
  created_at?: Date

  constructor({ _id, user_id, created_at, folower_user_id }: FolowerType) {
    const date = new Date()

    this._id = _id
    this.user_id = user_id
    this.folower_user_id = folower_user_id
    this.created_at = created_at || date
  }
}
