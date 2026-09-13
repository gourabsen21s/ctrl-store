import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/models/Customer";
import { signCustomerToken, setCustomerSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingCustomer = await CustomerModel.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await CustomerModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = await signCustomerToken({
      customerId: customer._id.toString(),
      email: customer.email,
      name: customer.name,
    });
    
    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: { id: customer._id, name: customer.name, email: customer.email },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
