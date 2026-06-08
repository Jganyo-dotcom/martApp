//const BaseApi = "https://martbackend-alnb.onrender.com/api/user";
//const BaseApi = "http://127.0.0.1:5173/api/user";
async function loginUser(identifier, password) {
  try {
    const user = { identifier, password }; // ✅ match backend
    const response = await fetch("/api/user/login", {
      // 🔑 plural "users"
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
      credentials: "include", // 🔑 ensures cookies are sent/received
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
}

export default loginUser;
