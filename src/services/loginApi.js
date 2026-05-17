//const BaseApi = "http://127.0.0.1:4444/api";
const BaseApi = "https://martbackend-alnb.onrender.com/api";

async function loginUser(identifier, password) {
  try {
    const user = { identifier, password }; // ✅ match backend
    const response = await fetch(`${BaseApi}/user/login`, {
      // also check plural
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await response.json();
   
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
}

export default loginUser;
