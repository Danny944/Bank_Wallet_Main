/*
// Transfer to another account
/accounts/:id/transfers

// Get transfer details on a specific account
/accounts/:id/transfers
*/
import client from "../config/db.js";
import { currencyConverter } from "./layer.js";
import { transferSchema } from "../validation/Schemas.js";
import { getTransferSchema } from "../validation/Schemas.js";
import { getTransfersOnAccountSchema } from "../validation/Schemas.js";

async function getAccountBalance(account_number, email) {
  const query = `
      SELECT account_balance 
      FROM account 
      WHERE user_email = $1 AND account_number = $2`;
  const values = [email, account_number];
  const { rows } = await client.query(query, values);
  console.log(rows[0].account_balance);
  return parseFloat(rows[0].account_balance);
}

async function getReceiverAccountBalance(account_number) {
  const query = `
      SELECT *
      FROM account 
      WHERE account_number = $1 `;
  const values = [account_number];
  const { rows } = await client.query(query, values);
  const balance = parseFloat(rows[0].account_balance);
  const currency = rows[0].currency_code;
  return { balance, currency };
}

async function updateAccountBalance(account_number, amount) {
  const query = `
      UPDATE account
      SET account_balance = $1
      WHERE account_number = $2
      RETURNING *
    `;
  const values = [amount, account_number];
  const result = await client.query(query, values);
  return result.rows[0];
}

export async function transferToAccount(user_email, payload) {
  const { error, value } = transferSchema.validate(payload);
  if (error) {
    console.log(error);
    return false;
  }
  const {
    user_account_number,
    receiver_account_number,
    amount,
    currency_code,
    description,
  } = value;
  try {
    const sender_account_balance = await getAccountBalance(
      user_account_number,
      user_email
    );
    if (sender_account_balance < amount) {
      console.log("Insufficient funds");
      return "Insufficient funds";
    }

    const receiver = await getReceiverAccountBalance(receiver_account_number);
    if (!receiver) {
      return "No user with the provided account number exists";
    }
    const receiver_currency = receiver.currency;
    const receiver_balance = receiver.balance;
    if (currency_code !== receiver_currency) {
      // Currency conversion is required
      const data = await currencyConverter(
        receiver_currency,
        sender_currency,
        amount
      );
      console.log(data);

      const converted_amount = data.result;
      const new_balance_sender = sender_account_balance - amount;
      const new_balance_receiver = receiver_balance + converted_amount;
      const new_balance_db_receiver = new_balance_receiver.toFixed(2);
      console.log(new_balance_db_receiver);

      // Update sender's balance
      const senderUpdate = await updateAccountBalance(
        user_account_number,
        new_balance_sender
      );
      console.log(senderUpdate);

      // Update receiver's balance
      const receiverUpdate = await updateAccountBalance(
        receiver_account_number,
        new_balance_db_receiver
      );
      console.log(receiverUpdate);
    } else {
      // No currency conversion needed
      const new_balance_sender = sender_account_balance - amount;
      const new_balance_receiver = receiver.balance + amount;

      // Update sender's balance
      const senderUpdate = await updateAccountBalance(
        user_account_number,
        new_balance_sender
      );
      console.log(senderUpdate);

      // Update receiver's balance
      const receiverUpdate = await updateAccountBalance(
        receiver_account_number,
        new_balance_receiver
      );
      console.log(receiverUpdate);
    }

    const query5 = `
      INSERT INTO transfers (user_email, description, account_number, amount, currency_code, third_party_acct_no )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values5 = [
      user_email,
      description,
      user_account_number,
      amount,
      currency_code,
      receiver_account_number,
    ];
    const transferResult = await client.query(query5, values5);
    console.log(transferResult.rows[0]);
    console.log("Transfer Successful");
    return transferResult.rows[0];
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

export async function getTransfer(user_email, payload) {
  const { value, error } = getTransferSchema.validate(payload);
  if (error) {
    console.log(error);
    return "Invalid Request";
  }
  const { account_number, transfer_id } = value;
  try {
    const query = `
      SELECT *
      FROM transfers
      WHERE transfer_id = $1 AND account_number = $2 AND user_email = $3
    `;
    const values = [transfer_id, account_number, user_email];
    const result = await client.query(query, values);
    if (!result.rows[0]) {
      console.log("No deposit found");
      return false;
    }
    console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error(err.message);
    throw err;
  }
}

// Get details of transfers on a specific account
export async function getTransfersOnAccount(user_email, payload) {
  const { value, error } = getTransfersOnAccountSchema.validate(payload);
  if (error) {
    console.log(error);
    return "Invalid Request";
  }
  const { account_number, currency_code } = value;
  try {
    const query = `
      SELECT *
      FROM transfers
      WHERE account_number = $1 AND currency_code = $2 AND user_email = $3
    `;
    const values = [account_number, currency_code, user_email];
    const result = await client.query(query, values);
    if (!result.rows[0]) {
      return false;
    }
    return result.rows;
  } catch (error) {
    console.error(err.message);
    throw err;
  }
}
