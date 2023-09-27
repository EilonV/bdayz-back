import express from 'express'
import UsersCtrl from './user.controller.js'
const router = express.Router()

router.route('/').get(UsersCtrl.apiGetUsers)
    .post(UsersCtrl.apiPostUser)
    .delete(UsersCtrl.apiDeleteUser)

router.route('/id/:id')
    .get(UsersCtrl.apiGetUserById)
    .post(UsersCtrl.apiPostBday)
    .delete(UsersCtrl.apiDeleteBday)

router.route('/bdayId/:bdayId')
    .get(UsersCtrl.apiGetBdayById)

export default router