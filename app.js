/* Tejasvi Communication — stock record app
   Demo version: browser localStorage only. Replace with a secure API/database for production. */
"use strict";

const STORAGE_KEY = "tejasvi_stock_record_v1";
const DEMO_PASSWORD = "tejasvi123";
let products = [];
let isAdmin = false;

const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function loadProducts() {
  try { products = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { products = []; }
  if (!Array.isArray(products)) products = [];
  if (products.length === 0) {
    products = [
      {id:"sample-1",brand:"Samsung",model:"Galaxy S Series",color:"Titanium Black",ram:"12 GB",storage:"256 GB",quantity:5,price:"",imageUrl:"",image:""},
      {id:"sample-2",brand:"Apple",model:"iPhone Pro",color:"Natural Titanium",ram:"",storage:"256 GB",quantity:3,price:"",imageUrl:"",image:""},
      {id:"sample-3",brand:"OnePlus",model:"OnePlus Series",color:"Midnight Ocean",ram:"12 GB",storage:"256 GB",quantity:2,price:"",imageUrl:"",image:""}
    ];
    persistProducts();
  }
}
function persistProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  $("lastUpdated").textContent = "Updated " + new Date().toLocaleString();
}
function getImage(product) { return product.image || product.imageUrl || ""; }

function renderStock() {
  const search = $("searchInput").value.trim().toLowerCase();
  const selectedBrand = $("brandFilter").value;
  const selectedColor = $("colorFilter").value;
  const selectedStock = $("stockFilter").value;

  const brands = [...new Set(products.map(p => p.brand))].sort();
  const colors = [...new Set(products.map(p => p.color))].sort();
  $("brandFilter").innerHTML = '<option value="">All brands</option>' + brands.map(v => `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join("");
  $("colorFilter").innerHTML = '<option value="">All colours</option>' + colors.map(v => `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join("");
  $("brandFilter").value = brands.includes(selectedBrand) ? selectedBrand : "";
  $("colorFilter").value = colors.includes(selectedColor) ? selectedColor : "";

  const filtered = products.filter(p => {
    const matchesSearch = `${p.brand} ${p.model}`.toLowerCase().includes(search);
    const matchesBrand = !$("brandFilter").value || p.brand === $("brandFilter").value;
    const matchesColor = !$("colorFilter").value || p.color === $("colorFilter").value;
    const matchesStock = !selectedStock ||
      (selectedStock === "available" && p.quantity > 5) ||
      (selectedStock === "low" && p.quantity > 0 && p.quantity <= 5) ||
      (selectedStock === "out" && p.quantity === 0);
    return matchesSearch && matchesBrand && matchesColor && matchesStock;
  });

  $("variantCount").textContent = products.length;
  $("unitCount").textContent = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  $("brandCount").textContent = brands.length;
  $("lowCount").textContent = products.filter(p => Number(p.quantity) <= 5).length;

  $("productGrid").innerHTML = filtered.length ? filtered.map(p => {
    const image = getImage(p);
    const statusClass = p.quantity === 0 ? "out-stock" : p.quantity <= 5 ? "low-stock" : "in-stock";
    return `<article class="product-card">
      <div class="product-photo">
        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(p.brand + " " + p.model)}" onerror="this.remove()">` : ""}
        <div class="photo-placeholder"><b>📱</b>Product photo</div>
      </div>
      <div class="product-body">
        <h3>${escapeHTML(p.brand)} ${escapeHTML(p.model)}</h3>
        <div class="muted small">${escapeHTML(p.ram)}${p.ram && p.storage ? " · " : ""}${escapeHTML(p.storage)}</div>
        <div class="chips"><span class="chip">${escapeHTML(p.color)}</span></div>
        <div class="quantity-row"><span>Available stock</span><strong class="${statusClass}">${Number(p.quantity)} units</strong></div>
        ${p.price ? `<div class="muted small" style="margin-top:8px">₹${Number(p.price).toLocaleString("en-IN")}</div>` : ""}
      </div></article>`;
  }).join("") : '<div class="empty-state">No matching stock found.</div>';
  // Keep the fallback label hidden whenever an image loads successfully.
  document.querySelectorAll(".product-photo img").forEach(img => {
    img.addEventListener("load", () => { const fallback = img.parentElement.querySelector(".photo-placeholder"); if (fallback) fallback.style.display = "none"; });
    img.addEventListener("error", () => { const fallback = img.parentElement.querySelector(".photo-placeholder"); if (fallback) fallback.style.display = "block"; });
  });
}

function showView(view) {
  ["stockView", "loginView", "adminView"].forEach(id => $(id).classList.add("hidden"));
  document.querySelectorAll(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.view === view || (view === "login" && button.dataset.view === "admin")));
  if (view === "stock") $("stockView").classList.remove("hidden");
  else if (view === "admin" && !isAdmin) $("loginView").classList.remove("hidden");
  else { $("adminView").classList.remove("hidden"); renderAdminTable(); }
}
function handleLogin(event) {
  event.preventDefault();
  if ($("adminPassword").value === DEMO_PASSWORD) {
    isAdmin = true; $("adminPassword").value = ""; showView("admin");
  } else alert("Incorrect demo password.");
}
function logout() { isAdmin = false; showView("stock"); }

function renderAdminTable() {
  $("inventoryRows").innerHTML = products.length ? products.map(p => `
    <tr>
      <td>${getImage(p) ? `<img class="thumb" src="${escapeHTML(getImage(p))}" alt="">` : ""}<b>${escapeHTML(p.brand)} ${escapeHTML(p.model)}</b></td>
      <td>${escapeHTML(p.color)}</td><td>${escapeHTML(p.ram)} / ${escapeHTML(p.storage)}</td>
      <td>${Number(p.quantity)}</td><td>${p.price ? "₹" + Number(p.price).toLocaleString("en-IN") : "—"}</td>
      <td><button class="button secondary" data-edit="${escapeHTML(p.id)}">Edit</button> <button class="button danger" data-delete="${escapeHTML(p.id)}">Delete</button></td>
    </tr>`).join("") : '<tr><td colspan="6">No stock items yet.</td></tr>';
}
function resetStockForm() {
  $("stockForm").reset(); $("productId").value = ""; $("quantity").value = 1;
  $("formHeading").textContent = "Add mobile stock";
}
function editProduct(id) {
  const p = products.find(item => item.id === id); if (!p) return;
  $("productId").value = p.id; $("brand").value = p.brand; $("model").value = p.model;
  $("color").value = p.color; $("ram").value = p.ram || ""; $("storage").value = p.storage || "";
  $("quantity").value = p.quantity; $("price").value = p.price || ""; $("imageUrl").value = p.imageUrl || "";
  $("formHeading").textContent = "Edit mobile stock";
  window.scrollTo({top: 0, behavior: "smooth"});
}
function deleteProduct(id) {
  if (!confirm("Delete this stock item?")) return;
  products = products.filter(p => p.id !== id); persistProducts(); renderAdminTable(); renderStock();
}
function saveStock(event) {
  event.preventDefault();
  const id = $("productId").value;
  const existing = products.find(p => p.id === id);
  const file = $("imageFile").files[0];
  const item = {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : "item-" + Date.now()),
    brand: $("brand").value.trim(), model: $("model").value.trim(),
    color: $("color").value.trim(), ram: $("ram").value.trim(),
    storage: $("storage").value.trim(), quantity: Number($("quantity").value),
    price: $("price").value, imageUrl: $("imageUrl").value.trim(),
    image: existing ? existing.image : ""
  };
  const finish = () => {
    if (id) products = products.map(p => p.id === id ? item : p);
    else products.unshift(item);
    try { persistProducts(); }
    catch { alert("Image is too large for browser storage. Please use a smaller image."); return; }
    resetStockForm(); renderAdminTable(); renderStock(); alert("Stock item saved on this device.");
  };
  if (file) {
    if (file.size > 2 * 1024 * 1024) { alert("Please choose an image smaller than 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { item.image = reader.result; finish(); };
    reader.onerror = () => alert("Could not read that image file.");
    reader.readAsDataURL(file);
  } else finish();
}

document.querySelectorAll(".nav-button").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
$("searchInput").addEventListener("input", renderStock);
["brandFilter", "colorFilter", "stockFilter"].forEach(id => $(id).addEventListener("change", renderStock));
$("loginForm").addEventListener("submit", handleLogin);
$("stockForm").addEventListener("submit", saveStock);
$("clearFormButton").addEventListener("click", resetStockForm);
$("logoutButton").addEventListener("click", logout);
$("inventoryRows").addEventListener("click", event => {
  const edit = event.target.closest("[data-edit]"); const del = event.target.closest("[data-delete]");
  if (edit) editProduct(edit.dataset.edit);
  if (del) deleteProduct(del.dataset.delete);
});

loadProducts();
renderStock();
$("year").textContent = new Date().getFullYear();
