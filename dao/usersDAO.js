import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID
let users

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return
    }
    try {
      users = await conn.db(process.env.RESTREVIEWS_NS).collection("users")
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in usersDAO: ${e}`,
      )
    }
  }

  static async getUsers({
    filters = null,
    page = 0,
    usersPerPage = 20,
  } = {}) {
    let query
    if (filters) {
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } }
      } else if ("email" in filters) {
        query = { "email": { $eq: filters["email"] } }
      } else if ("password" in filters) {
        query = { "password": { $eq: filters["password"] } }
      }
    }

    let cursor

    try {
      cursor = await users
        .find(query)
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { usersList: [], totalNumUsers: 0 }
    }

    const displayCursor = cursor.limit(usersPerPage).skip(usersPerPage * page)

    try {
      const usersList = await displayCursor.toArray()
      const totalNumUsers = await users.countDocuments(query)

      return { usersList, totalNumUsers }
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`,
      )
      return { usersList: [], totalNumUsers: 0 }
    }
  }

  static async getUserByID(id) {
    try {
      const pipeline = [
        {
          $match: {
            _id: new mongodb.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$id"],
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "users",
          },
        },
      ]
      return await users.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getUserByID: ${e}`)
      throw e
    }
  }

  static async addUser(password, userInfo, email) {
    try {
      const userDoc = {
        name: userInfo.name,
        email: email,
        password: password,
        bdayz: []
      }

      return await users.insertOne(userDoc)
    } catch (e) {
      console.error(`Unable to post user: ${e}`)
      return { error: e }
    }
  }

  static async getBdayByID(bdayId) {
    try {
      const pipeline = [
        {
          $match: {}, // Add any additional match criteria here if needed
        },
        {
          $unwind: "$bdayz", // Deconstruct the "bdayz" array
        },
        {
          $match: {
            "bdayz.bdayId": bdayId, // Match the "bdayId" within the array
          },
        },
        {
          $replaceRoot: { newRoot: "$bdayz" }, // Replace the root with the matched "bdayz" object
        },
      ];
      const result = await users.aggregate(pipeline).toArray();
      if (result.length > 0) {
        return result[0]; // Return the first matching "bdayz" object
      }
    }
    catch (e) {
      console.error(`Something went wrong in getUserByID: ${e}`)
      throw e
    }
  }

  static async deleteUser(id) {
    try {
      const deleteResponse = await users.deleteOne({
        _id: new mongodb.ObjectId(id),
      })

      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete user: ${e}`)
      return { error: e }
    }
  }

  static async deleteBday(id, bdayId) {
    try {
      const deleteResponse = await users.updateOne(
        {
          _id: new mongodb.ObjectId(id),
        },
        {
          $pull: {
            bdayz: {
              bdayId: new mongodb.ObjectId(bdayId),
            },
          },
        }
      );
  
      if (deleteResponse.matchedCount === 0) {
        return { error: 'User or bday not found' };
      }
  
      return { status: 'success' };
    } catch (e) {
      console.error(`Unable to delete bday: ${e}`);
      return { error: e };
    }
  }

  static async addBday(userId, additionalData) {
    try {
      // Define the update object with the fields to be modified
      // const additionalData = req.body.additionalData; // The data you want to add to the array

      const updateObj = {
        $push: {
          bdayz: additionalData, // Add the data to the 'bdayz' array
        },
      };

      // Use updateOne to update the user document
      const result = await users.updateOne({ _id: new mongodb.ObjectId(userId) }, updateObj);

      if (result.matchedCount === 0) {
        // No user found with the provided ID
        return { error: 'User not found' };
      }

      return result;
    } catch (e) {
      console.error(`Unable to update user: ${e}`);
      return { error: e + 'error bro' };
    }
  }

  static async findObjectByBdayId(id, bdayIdToFind) {
    try {
      const pipeline = [
        {
          $match: {
            bdayz: [
              {
                bdayId: new mongodb.ObjectId(id),
              }
            ]

          },
        },
        {
          $unwind: '$bdayz', // Unwind the 'bdayz' array
        },
        {
          $match: {
            'bdayz.bdayId': bdayIdToFind, // Match the 'bdayId' inside 'bdayz'
          },
        },
        {
          $project: {
            'bdayz': 1, // Include only the 'bdayz' array in the result
          },
        },
      ];

      const user = await users.aggregate(pipeline).next();
      if (!user) {
        throw new Error("User not found");
      }

      return user.bdayz; // Return the 'bdayz' array that matches the 'bdayId'
    } catch (e) {
      console.error(`Something went wrong in findObjectByBdayId: ${e}`);
      throw e;
    }
  }
}
