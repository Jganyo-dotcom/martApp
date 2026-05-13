const BaseApi = "my-api";

async function loginUser(username, password) {
  try {
    const user = { username, password };
    const response = await fetch(`${BaseApi}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login Error:", error);
  }
}

export default loginUser;
