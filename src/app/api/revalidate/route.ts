import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// POST - Revalidate cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, tag, all } = body;

    if (all) {
      // Revalidate all common paths
      revalidatePath("/", "layout");
      revalidatePath("/goods", "layout");
      revalidateTag("product");
      revalidateTag("products");
      revalidateTag("related-products");
      revalidateTag("categories");
      revalidateTag("homepage-data");
      return NextResponse.json({ 
        success: true, 
        message: "All caches revalidated" 
      });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        success: true, 
        message: `Path ${path} revalidated` 
      });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        success: true, 
        message: `Tag ${tag} revalidated` 
      });
    }

    return NextResponse.json(
      { error: "Please provide path, tag, or all=true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}

// GET - Simple revalidate all
export async function GET() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/goods", "layout");
    revalidateTag("product");
    revalidateTag("products");
    revalidateTag("related-products");
    revalidateTag("categories");
    revalidateTag("homepage-data");
    
    return NextResponse.json({ 
      success: true, 
      message: "All caches revalidated" 
    });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
