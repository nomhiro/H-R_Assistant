import { NextRequest, NextResponse } from "next/server";
import { getCosmosItemsByCategoryId } from "../../../../util/cosmos/document";

/**
 * GETメソッドで特定のカテゴリIDに基づいてCosmosItemを取得するAPIエンドポイント
 * GET /api/category/items
 * @param req - カテゴリIDを含むリクエストオブジェクト
 * @returns - CosmosItemの配列を含むレスポンスオブジェクト
 */
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json({ message: "Invalid category ID" }, { status: 400 });
    }

    console.log("Fetching items for category ID:", categoryId); // デバッグ用ログ

    const items = await getCosmosItemsByCategoryId(categoryId);

    console.log("Fetched items:", items); // デバッグ用ログ

    // アイテムが0件でも空の配列を返却
    return NextResponse.json(items || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching items by category ID:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};