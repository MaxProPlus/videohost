import {Request, Response, Router} from 'express'
import CommentController from '../controllers/CommentController'
import UserController from '../controllers/UserController'
import VideoController from '../controllers/VideoController'
import MyConnection from '../services/mysql'

const connection = new MyConnection()

const router = Router()

router.post('/users/general', (req: Request, res: Response) => (new UserController(connection)).updateGeneral(req, res))
router.post('/users/avatar', (req: Request, res: Response) => (new UserController(connection)).updateAvatar(req, res))
router.post('/users/secure', (req: Request, res: Response) => (new UserController(connection)).updateSecure(req, res))
router.post('/users/password', (req: Request, res: Response) => (new UserController(connection)).updatePassword(req, res))
router.get('/users/general', (req: Request, res: Response) => (new UserController(connection)).getGeneral(req, res))
router.post('/users/login', (req: Request, res: Response) => (new UserController(connection)).login(req, res))
router.get('/users/logout', (req: Request, res: Response) => (new UserController(connection)).logout(req, res))
router.get('/users/context', (req: Request, res: Response) => (new UserController(connection)).getContext(req, res))
router.post('/users/signup', (req: Request, res: Response) => (new UserController(connection)).signup(req, res))
router.get('/users/:id', (req: Request, res: Response) => (new UserController(connection)).getUser(req, res))

router.post('/videos/', (req: Request, res: Response) => (new VideoController(connection)).create(req, res))
router.post('/videos/estimate', (req: Request, res: Response) => (new VideoController(connection)).setEstimate(req, res))
router.get('/videos/rating', (req: Request, res: Response) => (new VideoController(connection)).getRating(req, res))
router.get('/videos/liking', (req: Request, res: Response) => (new VideoController(connection)).getLiking(req, res))
router.get('/videos/recently', (req: Request, res: Response) => (new VideoController(connection)).getRecently(req, res))
router.get('/videos/search', (req: Request, res: Response) => (new VideoController(connection)).search(req, res))
router.get('/videos/:id', (req: Request, res: Response) => (new VideoController(connection)).get(req, res))
router.put('/videos/:id', (req: Request, res: Response) => (new VideoController(connection)).update(req, res))
router.delete('/videos/:id', (req: Request, res: Response) => (new VideoController(connection)).remove(req, res))

router.post('/videos/:id_video/comments', (req: Request, res: Response) => (new CommentController(connection)).create(req, res))
router.get('/videos/:id_video/comments', (req: Request, res: Response) => (new CommentController(connection)).getByIdVideo(req, res))
router.delete('/videos/:id_video/comments/:id_comment', (req: Request, res: Response) => (new CommentController(connection)).remove(req, res))

export default router
