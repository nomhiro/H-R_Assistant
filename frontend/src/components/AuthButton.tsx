import { signIn, signOut } from "next-auth/react";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa"; // アイコンを追加

interface AuthButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant: "default" | "outline";
}

const AuthButton = ({ onClick, children, variant }: AuthButtonProps) => {
  const baseClasses = "px-2 py-1 rounded text-xs font-medium focus:outline-none focus:ring-2"; // サイズを小さく変更
  const variantClasses =
    variant === "default"
      ? "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-gray-200"
      : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-gray-200"; // サインアウトボタンも白に変更

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </button>
  );
};

export const LogInButton = () => {
  return (
    <AuthButton onClick={() => signIn()} variant={"default"}>
      <FaSignInAlt /> {/* ログインアイコンのみ表示 */}
    </AuthButton>
  );
};

export const LogOutButton = () => {
  return (
    <AuthButton onClick={() => signOut()} variant={"outline"}>
      <FaSignOutAlt /> {/* ログアウトアイコンのみ表示 */}
    </AuthButton>
  );
};