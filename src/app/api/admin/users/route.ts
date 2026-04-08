import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - List all users (admin only)
export async function GET() {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles });
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, name, role, department } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { error: "Email, password, name, and role are required" },
      { status: 400 }
    );
  }

  if (!["caregiver", "admin"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be 'caregiver' or 'admin'" },
      { status: 400 }
    );
  }

  // Create user using Supabase Admin API
  // Note: This requires using the service role key for admin operations
  // For now, we'll use signUp which works with anon key
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // The trigger should create the profile, but let's update it with additional info
  if (authData.user) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name,
        role,
        department: department || null,
        setup_completed: false,
      })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
    }
  }

  return NextResponse.json({
    success: true,
    message: "User created successfully. They will need to verify their email and complete setup on first login.",
    user: {
      id: authData.user?.id,
      email: authData.user?.email,
    },
  });
}
