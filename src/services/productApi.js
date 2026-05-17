//const BaseApi = "http://127.0.0.1:4444/api/product";
 const BaseApi = "https://martbackend-alnb.onrender.com/api/product";

// ✅ Helper to get token (from localStorage or context)
const getToken = () => localStorage.getItem("authToken");

// ✅ Fetch all products
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${BaseApi}/get-products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // 🔑 attach token
      },
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
    const response = await fetch(`${BaseApi}/add-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // 🔑 attach token
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const saveSaleToBackend = async (cart) => {
  const response = await fetch(`${BaseApi}/add-sale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        costPrice: item.costPrice,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save sale");
  }

  return await response.json();
};

export const handleDelete = async (productId) => {
  try {
    const response = await fetch(`${BaseApi}/delete-product/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response;

    // Refresh inventory after deletion
  } catch (err) {
    alert("Error deleting product: " + err.message);
  }
};

export const deleteSalesRecord = async (saleId) => {
  try {
    if (!saleId) {
      throw new Error("Sale ID is required to perform a deletion.");
    }

    // Sends a DELETE request to your backend endpoint (e.g., /api/sales/6a0a101655ed4856370ab0cb)
    const response = await axios.delete(`${API_BASE_URL}/sales/${saleId}`);

    // Return the data payload (like a success message) back to your component
    return response.data;
  } catch (error) {
    // Extracts the cleanest error message possible out of Axios responses
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete sales record";
    console.error("API Error in deleteSalesRecord:", errorMessage);
    throw new Error(errorMessage);
  }
};

// src/services/profitApi.js


// Fetch total profit for the current mart
export const fetchTotalProfit = async () => {
  try {
    const response = await fetch(`${BaseApi}/profit`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch total profit");

    const data = await response.json();
    console.log("Total Profit:", data);
    return data; // { mart: "...", totalProfit: 1234 }
  } catch (err) {
    console.error("Error fetching total profit:", err.message);
    throw err;
  }
};

export const handleUpdate = (productId) => {
  // TODO: open update modal
  alert(`Update product ${productId}`);
};

export const handleAdd = (productId) => {
  // TODO: open add modal
  alert(`Add more stock for product ${productId}`);
};

// src/services/salesService.js

// Fetch all sales records
export const fetchSales = async () => {
  try {
    const response = await fetch(`${BaseApi}/sales`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch sales");

    const data = await response.json();
    console.log("Raw API Response in service:", data);

    // ✅ FIX: Since data is already the array [0: {...}, 1: {...}], return it directly!
    return data;
  } catch (err) {
    console.error("Error fetching sales:", err.message);
    throw err;
  }
};
// Fetch profit summary (total revenue, profit, items sold)
export const fetchProfitSummary = async () => {
  try {
    const response = await fetch(`${BaseApi}/sales/summary`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch profit summary");
    return await response.json();
  } catch (err) {
    console.error("Error fetching profit summary:", err.message);
    throw err;
  }
};
