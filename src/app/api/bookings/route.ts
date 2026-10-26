import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

function isValidDate(date: unknown): date is string {
  if (typeof date !== "string") {
    return false;
  }

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

async function getDatabase() {
  const client = await clientPromise;
  return client.db("wanderlust");
}

function serializeDocument(document: any) {
  if (!document) {
    return null;
  }

  return {
    ...document,
    _id: document._id?.toString(),
  };
}

// GET: Fetch logged-in user's bookings with complete user and destination data.
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 },
      );
    }

    const db = await getDatabase();

    const user = {
      userId: currentUser.id,
      name: currentUser.name ?? "",
      email: currentUser.email ?? "",
      image: currentUser.image ?? null,
      emailVerified: currentUser.emailVerified ?? false,
      createdAt: currentUser.createdAt ?? null,
      updatedAt: currentUser.updatedAt ?? null,
    };

    const bookings = await db
      .collection("bookings")
      .find({ userId: currentUser.id })
      .sort({ createdAt: -1 })
      .toArray();

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const destinationId = String(
          booking.destinationId ?? booking.destination?.destinationId ?? "",
        );

        let destination = booking.destination ?? null;

        if (/^[a-fA-F0-9]{24}$/.test(destinationId)) {
          const destinationDocument = await db
            .collection("destinations")
            .findOne({
              _id: new ObjectId(destinationId),
            });

          if (destinationDocument) {
            destination = {
              ...serializeDocument(destinationDocument),
              destinationId: destinationDocument._id.toString(),
            };
          }
        }

        return {
          ...booking,
          _id: booking._id.toString(),
          id: booking._id.toString(),
          user: booking.user ?? user,
          destination,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings.",
      },
      { status: 500 },
    );
  }
}

// POST: Save a booking with complete user and destination information.
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to book a destination.",
        },
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
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { destinationId, departure } = body;

    if (
      typeof destinationId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(destinationId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid destination ID." },
        { status: 400 },
      );
    }

    if (!isValidDate(departure)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid departure date. Please select a valid date.",
        },
        { status: 400 },
      );
    }

    const normalizedDestinationId = destinationId.toLowerCase();
    const db = await getDatabase();

    const destinationDocument = await db.collection("destinations").findOne({
      _id: new ObjectId(normalizedDestinationId),
    });

    if (!destinationDocument) {
      return NextResponse.json(
        { success: false, message: "Destination not found." },
        { status: 404 },
      );
    }

    const duplicate = await db.collection("bookings").findOne({
      userId: currentUser.id,
      destinationId: normalizedDestinationId,
      status: { $ne: "Cancelled" },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already booked this destination.",
        },
        { status: 409 },
      );
    }

    const now = new Date();

    // Authenticated user information from Better Auth.
    const user = {
      userId: currentUser.id,
      name: currentUser.name ?? "",
      email: currentUser.email ?? "",
      image: currentUser.image ?? null,
      emailVerified: currentUser.emailVerified ?? false,
      createdAt: currentUser.createdAt ?? null,
      updatedAt: currentUser.updatedAt ?? null,
    };

    // Complete destination document from MongoDB.
    const destination = {
      ...serializeDocument(destinationDocument),
      destinationId: destinationDocument._id.toString(),
    };

    const booking = {
      userId: currentUser.id,
      email: currentUser.email ?? "",
      destinationId: normalizedDestinationId,

      user,
      destination,

      title: String(
        destinationDocument.destinationName ?? "Untitled Destination",
      ),
      image: String(destinationDocument.imageUrl ?? ""),
      departure,
      bookingId: `WB-${Date.now()}-${new ObjectId().toString().slice(-6)}`,
      price: Number(destinationDocument.price ?? 0),
      status: "Pending",

      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("bookings").insertOne(booking);

    return NextResponse.json(
      {
        success: true,
        message: "Booking saved successfully!",
        booking: {
          ...booking,
          _id: result.insertedId.toString(),
          id: result.insertedId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking. Please try again.",
      },
      { status: 500 },
    );
  }
}
