import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

function isValidDate(date: unknown): date is string {
  if (typeof date !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

// GET: Retrieve bookings for the logged-in user.
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 },
      );
    }

    const client = await clientPromise;
    const db = client.db("wanderlust");

    const bookings = await db
      .collection("bookings")
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
        ...booking,
        id: booking._id.toString(),
        _id: booking._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);

    return NextResponse.json(
      { message: "Failed to fetch bookings." },
      { status: 500 },
    );
  }
}

// POST: Create a booking.
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to book a destination." },
        { status: 401 },
      );
    }

    let body: {
      destinationId?: unknown;
      departure?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { destinationId, departure } = body;

    if (
      typeof destinationId !== "string" ||
      !ObjectId.isValid(destinationId) ||
      new ObjectId(destinationId).toString() !== destinationId.toLowerCase()
    ) {
      return NextResponse.json(
        { message: "Invalid destination ID." },
        { status: 400 },
      );
    }

    if (!isValidDate(departure)) {
      return NextResponse.json(
        { message: "Invalid departure date. Please select a valid date." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("wanderlust");

    const destination = await db.collection("destinations").findOne({
      _id: new ObjectId(destinationId),
    });

    if (!destination) {
      return NextResponse.json(
        { message: "Destination not found." },
        { status: 404 },
      );
    }

    const duplicate = await db.collection("bookings").findOne({
      userId: user.id,
      destinationId,
      status: { $ne: "Cancelled" },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "You have already booked this destination." },
        { status: 409 },
      );
    }

    const booking = {
      userId: user.id,
      email: user.email,
      destinationId,
      title: String(destination.destinationName ?? "Untitled Destination"),
      image: String(destination.imageUrl ?? ""),
      departure,
      bookingId: `WB-${Date.now()}-${new ObjectId().toString().slice(-6)}`,
      price: Number(destination.price ?? 0),
      status: "Pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    return NextResponse.json(
      {
        success: true,
        message: "Booking saved successfully!",
        booking: {
          ...booking,
          id: result.insertedId.toString(),
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      { message: "Failed to create booking. Please try again." },
      { status: 500 },
    );
  }
}
