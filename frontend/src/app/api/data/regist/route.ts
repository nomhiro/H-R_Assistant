import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadFileToFolder } from "@/util/blob";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let file = null;
    let folderPath = null;
    let text = null;

    // ファイルアップロードの場合と、テキストデータアップロードの場合で処理を分岐
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      file = formData.get("file");
      folderPath = formData.get("folderPath") as string;

      // ファイルがアップロードされているか確認
      if (file) {
        console.log(" 🚀ファイル（PDF、画像ファイル）を登録します");
        console.log(" 🚀フォルダパス: ", folderPath);
        console.log(" 🚀ファイル名: ", (file as File).name);
        // フォルダパスが文字列であることを確認
        if (typeof folderPath === 'string') {
          await uploadFileToFolder(folderPath, file as File);
        } else {
          console.log(" ❌フォルダパスが無効です。");
        }
      } else {
        console.log(" ❌ファイルがアップロードされていません。");
      }
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      text = json.text;
      console.log(" 🚀テキストデータを登録します。text: ", text);
    }

    return NextResponse.json({ message: " 🚀データが正常に登録されました" }, { status: 200 });
  } catch (error) {
    console.error(" ❌データ登録エラー:", error);
    return NextResponse.json({ message: " ❌データ登録に失敗しました" }, { status: 500 });
  }
}