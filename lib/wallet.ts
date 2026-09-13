import mongoose from "mongoose";
import { WalletModel } from "@/models/Wallet";
import { WalletTransactionModel, WalletTransactionReason, WalletTransactionReferenceType } from "@/models/WalletTransaction";

export async function getWallet(customerId: string) {
  let wallet = await WalletModel.findOne({ customerId });
  if (!wallet) {
    wallet = await WalletModel.create({ customerId });
  }
  return wallet;
}

export async function creditWallet({
  customerId,
  amount,
  reason,
  referenceId,
  referenceType,
  idempotencyKey,
  note,
}: {
  customerId: string;
  amount: number;
  reason: WalletTransactionReason;
  referenceId: string;
  referenceType: WalletTransactionReferenceType;
  idempotencyKey: string;
  note?: string;
}) {
  if (amount <= 0) throw new Error("Amount must be positive");

  // Prevent duplicate processing
  const existingTx = await WalletTransactionModel.findOne({ idempotencyKey });
  if (existingTx) return existingTx;

  const wallet = await getWallet(customerId);
  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { _id: wallet._id, version: wallet.version },
      {
        $inc: { balance: amount, lifetimeEarned: amount, version: 1 },
      },
      { new: true, session }
    );

    if (!updatedWallet) {
      throw new Error("Concurrent wallet update detected. Please try again.");
    }

    const tx = await WalletTransactionModel.create(
      [
        {
          walletId: wallet._id,
          customerId,
          type: "credit",
          amount,
          balanceBefore,
          balanceAfter,
          reason,
          referenceId,
          referenceType,
          idempotencyKey,
          note,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return tx[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function debitWallet({
  customerId,
  amount,
  reason,
  referenceId,
  referenceType,
  idempotencyKey,
  note,
}: {
  customerId: string;
  amount: number;
  reason: WalletTransactionReason;
  referenceId: string;
  referenceType: WalletTransactionReferenceType;
  idempotencyKey: string;
  note?: string;
}) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const existingTx = await WalletTransactionModel.findOne({ idempotencyKey });
  if (existingTx) return existingTx;

  const wallet = await getWallet(customerId);
  if (wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - amount;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { _id: wallet._id, version: wallet.version },
      {
        $inc: { balance: -amount, version: 1 },
      },
      { new: true, session }
    );

    if (!updatedWallet) {
      throw new Error("Concurrent wallet update detected. Please try again.");
    }

    const tx = await WalletTransactionModel.create(
      [
        {
          walletId: wallet._id,
          customerId,
          type: "debit",
          amount,
          balanceBefore,
          balanceAfter,
          reason,
          referenceId,
          referenceType,
          idempotencyKey,
          note,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return tx[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
