import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import categoriesRouter from "./categories";
import listingsRouter from "./listings";
import ordersRouter from "./orders";
import messagesRouter from "./messages";
import reviewsRouter from "./reviews";
import dashboardRouter from "./dashboard";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(categoriesRouter);
router.use(listingsRouter);
router.use(ordersRouter);
router.use(messagesRouter);
router.use(reviewsRouter);
router.use(dashboardRouter);
router.use(seedRouter);

export default router;
