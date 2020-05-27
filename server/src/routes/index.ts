import {Router} from 'express'
import CommentController from '../controllers/CommentController'
import UserController from '../controllers/UserController'
import VideoController from '../controllers/VideoController'

const router = Router()

const userController = new UserController()
const videoController = new VideoController()
const commentController = new CommentController()

router.post('/users/general', userController.updateGeneral)
router.post('/users/avatar', userController.updateAvatar)
router.post('/users/secure', userController.updateSecure)
router.post('/users/password', userController.updatePassword)
router.get('/users/general', userController.getGeneral)
router.post('/users/login', userController.login)
router.get('/users/logout', userController.logout)
router.get('/users/context', userController.getContext)
router.post('/users/signup', userController.signup)
router.get('/users/:id', userController.getUser)

router.post('/videos/', videoController.create)
router.post('/videos/estimate', videoController.setEstimate)
router.get('/videos/rating', videoController.getRating)
router.get('/videos/liking', videoController.getLiking)
router.get('/videos/recently', videoController.getRecently)
router.get('/videos/search', videoController.search)
router.get('/videos/:id', videoController.get)
router.put('/videos/:id', videoController.update)
router.delete('/videos/:id', videoController.remove)

router.post('/videos/:id_video/comments', commentController.create)
router.get('/videos/:id_video/comments', commentController.getByIdVideo)
router.delete('/videos/:id_video/comments/:id_comment', commentController.remove)

export default router
