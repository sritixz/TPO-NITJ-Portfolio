import express from 'express';
const router = express.Router();
import {restrictTo} from '../utils/restrict.js';
import {createIssue,getUserIssues,getAllIssues,resolveIssue,getUnresolvedIssues} from '../controller/reqhelp.js';

router.post('/create',restrictTo('Student'),createIssue);
// router.get('/get-all-issue',getAllIssues);
router.get('/get-unresolved', restrictTo('Professor'),getUnresolvedIssues);
router.get('/get-own-issue', restrictTo('Student','Recuiter'), getUserIssues);
router.put('/resolve/:issueId/:detailId',restrictTo('Professor'),resolveIssue);


export default router;