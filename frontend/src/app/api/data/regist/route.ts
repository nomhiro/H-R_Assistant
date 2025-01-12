import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadFileToFolder } from "@/util/blob";

export const POST = async (req: NextRequest) => {
  try {
    const contentType = req.headers.get("content-type") || "";
    let file: FormDataEntryValue | null = null;
    let folderPath: string | null = null;
    let text = null;

    if (!contentType) {
      console.error(" ❌content-typeヘッダーが設定されていません。");
      return NextResponse.json({ message: " ❌content-typeヘッダーが設定されていません。" }, { status: 400 });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      file = formData.get("file");
      folderPath = formData.get("folderPath") as string;

      if (file && folderPath) {
        console.log(" 🚀ファイル（PDF、画像ファイル）を登録します");
        console.log(" 🚀フォルダパス: ", folderPath);
        console.log(" 🚀ファイル名: ", (file as File).name);
        if (typeof folderPath === 'string') {
          console.log(" 🚀アップロードを開始します");
          await uploadFileToFolder(folderPath, file as File);
          console.log(" 🚀アップロードが完了しました");
        } else {
          console.log(" ❌フォルダパスが無効です。");
          return NextResponse.json({ message: " ❌フォルダパスが無効です。" }, { status: 400 });
        }
      } else {
        console.log(" ❌ファイルまたはフォルダパスがアップロードされていません。");
        return NextResponse.json({ message: " ❌ファイルまたはフォルダパスがアップロードされていません。" }, { status: 400 });
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