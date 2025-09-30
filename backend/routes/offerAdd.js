import express from "express";
const router=express.Router();

import { getStudentByRoll,addOffer,getManualOffers,updateOffer } from "../controller/offerAdd.js";


router.get("/get/:roll",getStudentByRoll);
router.post("/add",addOffer);
router.get("/get-all",getManualOffers );
router.put("/update/:id",updateOffer);

export default router;