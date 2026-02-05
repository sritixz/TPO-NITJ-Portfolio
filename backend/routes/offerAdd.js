import express from "express";
const router=express.Router();

import { getStudentByRoll,addOffer,getManualOffers,updateOffer, getManualSummerIntern, updateSummerIntern } from "../controller/offerAdd.js";


router.get("/get/:roll",getStudentByRoll);
router.post("/add",addOffer);
router.get("/get-all",getManualOffers );
router.get("/get-all-summerIntern",getManualSummerIntern );
router.put("/update/:id",updateOffer);
router.put("/update-summerIntern/:id",updateSummerIntern);


export default router;