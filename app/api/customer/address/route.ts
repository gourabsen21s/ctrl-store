import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/models/Customer";

export async function PUT(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, street, city, state, postalCode, country, landmark } = body;

    await connectToDatabase();

    const customer = await CustomerModel.findById(session.customerId);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (phone !== undefined) customer.phone = String(phone).trim();
    customer.defaultAddress = {
      street: String(street || "").trim(),
      city: String(city || "").trim(),
      state: String(state || "").trim(),
      postalCode: String(postalCode || "").trim(),
      country: String(country || "India").trim(),
      landmark: landmark ? String(landmark).trim() : undefined,
    };

    await customer.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        defaultAddress: customer.defaultAddress,
      },
    });
  } catch (error: any) {
    console.error("Update Customer Address Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
