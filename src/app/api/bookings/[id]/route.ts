import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("wanderlust");
    const bookings = db.collection("bookings");

    const result = await bookings.updateOne(
      {
        _id: new ObjectId(id),
        userId: user.id,
        status: { $ne: "Cancelled" },
      },
      {
        $set: {
          status: "Cancelled",
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Booking not found or already cancelled." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      { message: "Failed to cancel booking." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("wanderlust");
    const bookings = db.collection("bookings");

    const result = await bookings.deleteOne({
      _id: new ObjectId(id),
      userId: user.id,
      status: "Cancelled",
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          message:
            "Cancelled booking not found. Only cancelled bookings can be deleted.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return NextResponse.json(
      { message: "Failed to delete booking." },
      { status: 500 },
    );
  }
}
