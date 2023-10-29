import { transferToAccount } from "../models/tranfers.js";
import { getTransfer } from "../models/tranfers.js";
import { getTransfersOnAccount } from "../models/tranfers.js";

// Transfer funds to another account
export async function transferToAnAccount(req, res) {
  try {
    const user_email = req.user_email;
    const data = await transferToAccount(user_email, req.body);
    if (!data) {
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (data === "Invalid Request") {
      return res.status(400).json({ error: "Error Invalid Request" });
    }

    if (data === "You are not allowed to carry out this action") {
      return res
        .status(400)
        .json({ error: "You are not allowed to carry out this action" });
    }

    if (data === "Insufficient funds") {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    if (data === "No user with the provided account number exists") {
      return res
        .status(400)
        .json({ error: "No user with the provided account number exists" });
    }

    return res.status(201).json({
      message: "Transfer successful",
      transfer_details: data,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Get details for a specific transfer
export async function getATransfer(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getTransfer(user_email, req.body);
    if (data === "Invalid Request") {
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (data === "No transfer found") {
      return res.status(400).json({ error: "No transfer found" });
    }
    if (data === "You are not allowed to carry out this action") {
      return res
        .status(400)
        .json({ error: "You are not allowed to carry out this action" });
    }
    return res.status(201).json({
      message: "Transfer details",
      details: data,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Get transfers associated with a user's account
export async function getTransfersOnAnAccount(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getTransfersOnAccount(user_email, req.body);
    if (data === "Invalid Request") {
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (!data) {
      return res.status(400).json({ error: "No transfers found" });
    }
    if (data === "You are not allowed to carry out this action") {
      return res
        .status(400)
        .json({ error: "You are not allowed to carry out this action" });
    }
    return res.status(201).json({
      message: "Transfer details",
      details: data,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
