//const BaseApi = "http://127.0.0.1:4444/api/product";
const BaseApi = "ii";

// ✅ Fetch all products
export const getAllProducts = async () => {
  try {
    const response = await fetch("/products", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔑 send cookies
    });
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// ✅ Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await fetch("/addProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// ✅ Save sale
export const saveSaleToBackend = async (cart, customerName) => {
  const response = await fetch("/addSale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        costPrice: item.costPrice,
      })),
      customerName: customerName || "Walking Customer",
    }),
  });

  if (!response.ok) throw new Error("Failed to save sale");
  return await response.json();
};

// ✅ Delete product
export const handleDelete = async (productId) => {
  try {
    const response = await fetch(`${BaseApi}/delete-product/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response;
  } catch (err) {
    alert("Error deleting product: " + err.message);
  }
};

// ✅ Fetch total profit
export const fetchTotalProfit = async () => {
  try {
    const response = await fetch("/api/profit", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch total profit");
    return await response.json();
  } catch (err) {
    console.error("Error fetching total profit:", err.message);
    throw err;
  }
};

// ✅ Delete sale item
export const deleteSaleItem = async (
  saleId,
  inputer,
  quantity,
  productName,
) => {
  try {
    const response = await fetch(
      `${BaseApi}/sales/${saleId}/item/${encodeURIComponent(productName)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inputer, quantity }),
      },
    );
    if (!response.ok) throw new Error("Failed to delete sale item");
    return await response.json();
  } catch (err) {
    console.error("Error deleting sale item:", err.message);
    throw err;
  }
};

// 1. Fetch single item by ID
export const getProductById = async (productId) => {
  console.log(productId);
  const response = await fetch(`/baseRoute/get-product/${productId}`, {
    method: "GET", // use GET for fetching
    credentials: "include", // send cookies
  });

  // fetch returns a Response object, so you need to parse JSON
  const data = await response.json();
  return data;
};

// 2. Submit dynamic box/pack increment update payload
export const handleAdd = async (productId, payload) => {
  const response = await fetch(`/baseRoute/add-packs/${productId}`, {
    method: "PATCH",
    credentials: "include", // send cookies
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload), // attach payload
  });

  const data = await response.json();
  return data;
};

export const handleUpdate = async (productId, payload) => {
  const response = await fetch(`/baseRoute/add-tock/${productId}`, {
    method: "PATCH",
    credentials: "include", // send cookies
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload), // attach payload
  });

  const data = await response.json();
  return data;
};
// ✅ Fetch all sales
export const fetchSales = async () => {
  try {
    const response = await fetch("/getSales", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch sales");
    return await response.json();
  } catch (err) {
    console.error("Error fetching sales:", err.message);
    throw err;
  }
};

// ✅ Fetch profit summary
export const fetchProfitSummary = async () => {
  try {
    const response = await fetch("saleSummary", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch profit summary");
    return await response.json();
  } catch (err) {
    console.error("Error fetching profit summary:", err.message);
    throw err;
  }
};
