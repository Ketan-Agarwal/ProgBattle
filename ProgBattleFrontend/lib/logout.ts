import { userlogout } from "./api";

export async function logout(setUser: (user: any) => void) {
  try {
    const res = await userlogout();
    console.log(res);
    if (res.message === "Logged out successfully") {
      setUser(null);
    } else {
      console.error('logout failed:', await res.text());
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
}
