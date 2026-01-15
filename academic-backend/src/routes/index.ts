import { Router } from 'express';

import timetableRoutes from './timetable.routes';
import attendanceRoutes from './attendance.routes';
import marksRoutes from './marks.routes';
import groupRoutes from './group.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Academic operation routes
router.use('/timetable', timetableRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/marks', marksRoutes);
router.use('/groups', groupRoutes);
router.use('/notifications', notificationRoutes);

export default router;
