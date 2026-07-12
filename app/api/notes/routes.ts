import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const db = await getDb();

    const notes = db.collection("notes");
    const categories = db.collection("categories");

    const {
      category,
      title,
      text,
      tags,
      username,
    } = body;


    // Create category if it doesn't exist
    await categories.updateOne(
      { slug: category },
      {
        $setOnInsert: {
          slug: category,
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );


    // Save note
    const result = await notes.insertOne({
      username,
      category,
      title,
      text,
      tags,
      createdAt: new Date(),
    });


    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}