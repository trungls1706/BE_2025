import dotenv from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import Follower from '~/models/schemas/Follower.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
dotenv.config()

const URI_DB = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@be2025.yujlkza.mongodb.net/?retryWrites=true&w=majority&appName=BE2025`

class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(URI_DB)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      // Ensures that the client will close when you finish/error
      // await this.client.close()
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as 'string')
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as 'string')
  }

    get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as 'string')
  }
}

const databaseServices = new DatabaseServices()

export default databaseServices
