import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, deleteCategoryById, registerCategory, updateCategoryById } from "../../../util/cosmos/category";
import { CategoryItem } from "../../../models/models";
import { v4 as uuidv4 } from "uuid";
import { getCosmosItemsByCategoryId } from "../../../util/cosmos/document";

/**
 * GETメソッドで全てのカテゴリを取得するAPIエンドポイント
 * GET /api/category
 * @returns - カテゴリの配列を含むレスポンスオブジェクト
 */
export const GET = async () => {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("🚀Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
};

/**
 * POSTメソッドで新しいカテゴリを登録するAPIエンドポイント
 * POST /api/category
 * @param req - カテゴリ名と順序を含むリクエストオブジェクト
 * @returns - 登録結果を含むレスポンスオブジェクト
 * @throws - 入力が無効な場合は400エラー、サーバーエラーが発生した場合は500エラーを返します
 */
export const POST = async (req: NextRequest) => {
  try {
    const { category, order } = await req.json();

    if (!category || typeof category !== "string") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const newCategory: CategoryItem = {
      id: uuidv4(),
      category,
      order: typeof order === "number" ? order : 0, // 順序が指定されていない場合はデフォルト値を使用
    };

    await registerCategory(newCategory);
    return NextResponse.json(newCategory, { status: 201 }); // 新しいカテゴリ情報を返す
  } catch (error: any) {
    console.error("Error registering category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};

/**
 * PATCHメソッドでカテゴリを更新するAPIエンドポイント
 * PATCH /api/category
 * @param req - カテゴリのid, カテゴリ名, 順序を含むリクエストオブジェクト
 * @returns - 更新結果を含むレスポンスオブジェクト
 */
export const PATCH = async (req: NextRequest) => {
  try {
    const { id, category, order } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "IDが無効です。文字列形式のIDを指定してください。" }, { status: 400 });
    }

    const updates: { category?: string; order?: number } = {};
    if (category && typeof category === "string") {
      updates.category = category;
    } else if (category) {
      return NextResponse.json({ message: "カテゴリが無効です。文字列形式で指定してください。" }, { status: 400 });
    }

    updates.order = typeof order === "number" ? order : undefined; // 順序が指定されていない場合はundefinedに設定

    const result = await updateCategoryById(id, updates);

    if (!result) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};

/**
 * DELETEメソッドでカテゴリを削除するAPIエンドポイント
 * DELETE /api/category
 * @param req - 削除するカテゴリのidを含むリクエストオブジェクト
 * @returns - 削除結果を含むレスポンスオブジェクト
 */
export const DELETE = async (req: NextRequest) => {
  try {
    const { id } = await req.json();
    console.log("🚀Deleting category with ID:", id);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // カテゴリに紐づくドキュメントが存在するか確認
    const documents = await getCosmosItemsByCategoryId(id);
    if (documents.length > 0) {
      return NextResponse.json(
        { message: "登録されているドキュメントを先に削除してください。" },
        { status: 400 }
      );
    }

    await deleteCategoryById(id);

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};
