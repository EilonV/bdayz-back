import UsersDAO from "../dao/usersDAO.js"
import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID

export default class UsersController {

  static async apiGetUsers(req, res, next) {
    const usersPerPage = req.query.usersPerPage ? parseInt(req.query.usersPerPage, 10) : 20
    const page = req.query.page ? parseInt(req.query.page, 10) : 0

    let filters = {}
    if (req.query.email) {
      filters.email = req.query.email
    } else if (req.query.password) {
      filters.password = req.query.password
    } else if (req.query.name) {
      filters.name = req.query.name
    }

    const { usersList, totalNumUsers } = await UsersDAO.getUsers({
      filters,
      page,
      usersPerPage,
    })

    let response = {
      users: usersList,
      page: page,
      filters: filters,
      entries_per_page: usersPerPage,
      total_results: totalNumUsers,
    }
    res.json(response)
  }

  static async apiGetUserById(req, res, next) {
    try {
      let id = req.params.id || {}
      let user = await UsersDAO.getUserByID(id)
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      res.json(user)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async apiGetBdayById(req, res, next) {
    try {
      let bdayId = req.params.bdayId || {}
      let bday = await UsersDAO.getBdayByID(bdayId)
      if (!bday) {
        res.status(404).json({ error: "Bday not found" })
        return
      }
      res.json(user)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async apiDeleteUser(req, res, next) {
    try {
      const id = req.query.id
      const reviewResponse = await UsersDAO.deleteUser(
        id
      )
      res.json({ status: "success" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiDeleteBday(req, res, next) {
    try {
      const id = req.params.id;
      const bdayId = req.query.bdayId;

      const deleteResponse = await UsersDAO.deleteBday(id, bdayId);

      if (deleteResponse.error) {
        return res.status(404).json({ error: 'User or bday not found' });
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiPostUser(req, res, next) {
    try {
      const pass = req.body.pass
      const email = req.body.email
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id
      }
      const bdayz = []

      const UserResponse = await UsersDAO.addUser(
        pass,
        userInfo,
        email,
        bdayz
      )
      res.json({ status: "success" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiPostBday(req, res, next) {
    try {
      const userId = req.params.id; // Extract user ID from the URL
      const name = req.body.name; // The data you want to add to the array
      const date = req.body.date; // The data you want to add to the array
      // Add other fields to be updated here

      // Define the update object with the fields to be modified
      const bday = {
        name: name,
        date: date,
        bdayId: new mongodb.ObjectId()
      }
      // Use updateOne to update the user document
      const result = await UsersDAO.addBday(userId, bday);

      if (result.error) {
        // Handle the case where no user is found with the provided userId
        return res.status(404).json({ error: 'error mate' });
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: "cannot edit user" });
    }
  }

  static async apiGetUserBdayById(req, res, next) {
    try {
      const userId = req.params.id;
      const bdayId = req.params.bdayId; // Assuming you pass bdayId as a query parameter

      if (!userId || !bdayId) {
        res.status(400).json({ error: "User ID and bdayId are required" });
        return;
      }

      const userBdayInfo = await UsersDAO.findObjectByBdayId(userId, bdayId);

      if (!userBdayInfo) {
        res.status(404).json({ error: "Birthday info not found" });
        return;
      }

      res.json(userBdayInfo);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

}