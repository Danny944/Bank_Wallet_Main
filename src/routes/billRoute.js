import express from "express";
const billRoute = express.Router();

import { makeABillPayment } from "../controllers/bills.js";
import { getABillPayment } from "../controllers/bills.js";
import { getBillsOnAccount } from "../models/bills.js";
import { authUser } from "../middlewares/authuser.js";

billRoute.post("/pay-a-bill", authUser, makeABillPayment);
billRoute.get("/get-a-bill-payment", authUser, getABillPayment);
billRoute.get("/get-bills-on-account", authUser, getBillsOnAccount);

export default billRoute;
