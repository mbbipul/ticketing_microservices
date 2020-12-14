import express from 'express';
import { currentUser } from '@bb_dev/ticketing_common_service';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
