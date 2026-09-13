import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/models/Customer";
import { signCustomerToken, setCustomerSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const customer = await CustomerModel.findOne({ email: email.toLowerCase() });
    if (!customer || !customer.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
