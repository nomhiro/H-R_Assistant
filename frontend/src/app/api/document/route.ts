import { NextRequest, NextResponse } from "next/server";
import { registerItem, deleteItem, updateItem } from "../../../util/cosmos/document"; // 修正: updateItemをインポート
import { getEmbedding, getChatCompletions } from "../../../util/openai";
import { v4 as uuidv4 } from "uuid";
import { getCategoryById } from "../../../util/cosmos/category"

/**
 * POSTメソッドで新しいアイテムを登録するAPIエンドポイント
 * @param req - カテゴリIDとコンテンツを含むリクエストオブジェクト
 * @returns - 登録結果を含むレスポンスオブジェクト
 * 
 * @throws {Error} - 入力が無効な場合、または内部サーバーエラーが発生した場合
 */
export const POST = async (req: NextRequest) => {
  try {
    const { category_id, content } = await req.json();

    if (!category_id || typeof category_id !== "string" || !content || typeof content !== "string") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    console.log("🚀Registering item with category ID:", category_id, "and content:", content);

    // カテゴリIDからカテゴリ情報を取得
    const category = await getCategoryById(category_id);

    // OpenAIのAPIを使用してコンテンツのベクトルを取得
    const contentVector = await getEmbedding(`${category?.category} \n${content}`);

    // OpenAIのAPIを使用してドキュメントタイトルを取得
    const systemMessage = `あなたは優秀なライターです。与えられた内容からタイトルを生成してください。\n\n- タイトルのみを出力してください。「」など不要です。`;
    const titleResponse = await getChatCompletions(systemMessage, content);

    const newItem = {
      id: uuidv4(),
      category_id,
      page_number: 0, // 空の値
      content,
      content_vector: contentVector,
      keywords: [], // 空の配列
      file_name: titleResponse[0].message.content, // タイトルフィールドとする
      file_path: "", // 空の値
      is_contain_image: false,
      image_blob_path: "",
    };

    await registerItem(newItem);
    return NextResponse.json({ message: "Item registered successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("エラー詳細:", {
      message: error.message,
      stack: error.stack,
      additionalInfo: error.response || "追加情報なし",
    });
    return NextResponse.json({ message: "Internal server error", details: error.message }, { status: 500 });
  }
};

/**
 * DELETEメソッドでドキュメントを削除するAPIエンドポイント
 * @param req - 削除するドキュメントのIDを含むリクエストオブジェクト
 * @returns - 削除結果を含むレスポンスオブジェクト
 * 
 * @throws {Error} - 入力が無効な場合、または内部サーバーエラーが発生した場合
 */
export const DELETE = async (req: NextRequest) => {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    console.log("🚀Deleting item with ID:", id);

    await deleteItem(id); // 修正: deleteItemを使用
    return NextResponse.json({ message: "Document deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("エラー詳細:", {
      message: error.message,
      stack: error.stack,
      additionalInfo: error.response || "追加情報なし",
    });
    return NextResponse.json({ message: "Internal server error", details: error.message }, { status: 500 });
  }
};

/**
 * PATCHメソッドでドキュメントを更新するAPIエンドポイント
 * @param req - 更新するドキュメントのID、新しい内容、カテゴリIDを含むリクエストオブジェクト
 * @returns - 更新結果を含むレスポンスオブジェクト
 */
export const PATCH = async (req: NextRequest) => {
  try {
    const { id, content, category_id } = await req.json();

    // 入力検証
    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "Invalid or missing 'id'" }, { status: 400 });
    }
    if (!content || typeof content !== "string") {
      return NextResponse.json({ message: "Invalid or missing 'content'" }, { status: 400 });
    }
    if (!category_id || typeof category_id !== "string") {
      return NextResponse.json({ message: "Invalid or missing 'category_id'" }, { status: 400 });
    }

    console.log("🚀Updating document with ID:", id, "new content:", content, "and category ID:", category_id);

    // カテゴリIDからカテゴリ情報を取得
    const category = await getCategoryById(category_id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    // OpenAIのAPIを使用して新しいコンテンツのベクトルを取得
    const contentVector = await getEmbedding(`${category.category} \n${content}`);

    // OpenAIのAPIを使用してドキュメントタイトルを取得
    const systemMessage = `あなたは優秀なライターです。与えられた内容からタイトルを生成してください。\n\n- タイトルのみを出力してください。「」など不要です。`;
    const titleResponse = await getChatCompletions(systemMessage, content);

    // ドキュメントを更新
    const updatedItem = {
      content,
      content_vector: contentVector,
      category_id,
      file_name: titleResponse[0].message.content, // タイトルフィールドとする
    };

    await updateItem(id, updatedItem);

    return NextResponse.json({ message: "Document updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("エラー詳細:", {
      message: error.message,
      stack: error.stack,
      additionalInfo: error.response || "追加情報なし",
    });
    return NextResponse.json({ message: "Internal server error", details: error.message }, { status: 500 });
  }
};

