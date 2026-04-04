"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Coffee,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Package,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  LogOut,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

type MenuForm = {
  name: string;
  price: string;
  description: string;
  category: string;
  available: boolean;
  quantity: string;
  imageEmoji: string;
};

const emptyForm: MenuForm = {
  name: "",
  price: "",
  description: "",
  category: "Hot Drinks",
  available: true,
  quantity: "50",
  imageEmoji: "☕",
};

const CATEGORIES = ["Hot Drinks", "Cold Drinks", "Specialty", "Food", "Other"];

const STATUS_FLOW: Record<string, string[]> = {
  paid: ["preparing"],
  preparing: ["ready"],
  ready: ["picked_up"],
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  paid: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  preparing: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  ready: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  picked_up: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default function AdminMenuPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const currentUser = useQuery(api.users.currentUser);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "owner") {
      router.push("/");
    }
  }, [currentUser, router]);

  const menuItems = useQuery(api.menu.list);
  const orders = useQuery(api.orders.list);
  const addItem = useMutation(api.menu.add);
  const updateItem = useMutation(api.menu.update);
  const removeItem = useMutation(api.menu.remove);
  const seedMenu = useMutation(api.menu.seed);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  const [editingId, setEditingId] = useState<Id<"menu"> | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("orders");

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
        <Loader2 size={32} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  if (currentUser.role !== "owner") {
    return null;
  }

  const handleEdit = (item: {
    _id: Id<"menu">;
    name: string;
    price: number;
    description: string;
    category: string;
    available: boolean;
    quantity: number;
    imageEmoji?: string;
  }) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
      available: item.available,
      quantity: item.quantity.toString(),
      imageEmoji: item.imageEmoji || "☕",
    });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    const price = parseFloat(form.price);
    const quantity = parseInt(form.quantity);
    if (!form.name.trim() || isNaN(price) || isNaN(quantity)) return;

    if (editingId) {
      await updateItem({
        id: editingId,
        name: form.name.trim(),
        price,
        description: form.description.trim(),
        category: form.category,
        available: form.available,
        quantity,
        imageEmoji: form.imageEmoji || undefined,
      });
      setEditingId(null);
    } else {
      await addItem({
        name: form.name.trim(),
        price,
        description: form.description.trim(),
        category: form.category,
        available: form.available,
        quantity,
        imageEmoji: form.imageEmoji || undefined,
      });
      setShowAddForm(false);
    }
    setForm(emptyForm);
  };

  const handleDelete = async (id: Id<"menu">) => {
    await removeItem({ id });
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyForm);
  };

  // Group orders by status for the dashboard
  const activeOrders = orders?.filter(
    (o) => o.status === "paid" || o.status === "preparing" || o.status === "ready",
  ) ?? [];
  const recentOrders = orders?.slice(0, 20) ?? [];

  return (
    <div className="min-h-screen bg-[#0a0908] text-stone-100">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0908]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-600">
                <Coffee size={16} className="text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Owner Dashboard</h1>
                <p className="text-[11px] text-stone-500">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 hover:text-white hover:border-white/20 transition-all"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Menu Items", value: menuItems?.length ?? 0, icon: Package },
            {
              label: "Available",
              value: menuItems?.filter((i) => i.available && i.quantity > 0).length ?? 0,
              icon: Coffee,
            },
            { label: "Active Orders", value: activeOrders.length, icon: Clock },
            { label: "Total Orders", value: orders?.length ?? 0, icon: ShoppingBag },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/6 bg-white/3 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Icon size={14} className="text-amber-400" />
                </div>
                <span className="text-xs text-stone-500">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/3 rounded-xl p-1 border border-white/6 w-fit">
          {(["orders", "menu"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-amber-500 text-white"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {tab === "orders" ? "Orders" : "Menu"}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ─── */}
        {activeTab === "orders" && (
          <>
            {activeOrders.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-sm mb-3 text-amber-400">
                  Active Orders ({activeOrders.length})
                </h2>
                <div className="space-y-2">
                  {activeOrders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-2xl border border-white/6 bg-white/3 p-5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border ${STATUS_COLORS[order.status] || ""}`}
                          >
                            {order.status === "picked_up" ? "Picked Up" : order.status}
                          </span>
                          <span className="text-xs text-stone-500">
                            {order.pickupName || "Customer"}
                          </span>
                          <span className="text-xs text-stone-600">
                            {new Date(order.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-amber-400">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-stone-400">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </p>
                        <div className="flex gap-1.5">
                          {(STATUS_FLOW[order.status] || []).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() =>
                                updateOrderStatus({
                                  id: order._id,
                                  status: nextStatus as "preparing" | "ready" | "picked_up" | "cancelled",
                                })
                              }
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                            >
                              <ChevronRight size={12} />
                              {nextStatus === "picked_up"
                                ? "Mark Picked Up"
                                : `Mark ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                            </button>
                          ))}
                          {order.status !== "cancelled" && (
                            <button
                              onClick={() =>
                                updateOrderStatus({ id: order._id, status: "cancelled" })
                              }
                              className="text-xs px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/6 overflow-hidden">
              <div className="bg-white/3 px-5 py-3 border-b border-white/6">
                <h2 className="font-semibold text-sm">All Orders</h2>
              </div>
              {!orders ? (
                <div className="px-5 py-12 text-center text-stone-500 text-sm">
                  Loading…
                </div>
              ) : orders.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <ShoppingBag size={32} className="text-stone-700 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="px-5 py-4 hover:bg-white/2 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border ${STATUS_COLORS[order.status] || ""}`}
                          >
                            {order.status === "picked_up" ? "Picked Up" : order.status}
                          </span>
                          <span className="text-xs text-stone-500">
                            {order.pickupName || "Customer"}
                          </span>
                          <span className="text-xs text-stone-600">
                            {new Date(order.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className="font-semibold text-sm text-amber-400">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── MENU TAB ─── */}
        {activeTab === "menu" && (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => seedMenu()}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 hover:text-white hover:border-white/20 transition-all"
              >
                Seed Default Items
              </button>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-400 transition-colors"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>

            {(showAddForm || editingId) && (
              <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm text-amber-400">
                    {editingId ? "Edit Item" : "Add New Item"}
                  </h2>
                  <button onClick={handleCancel} className="text-stone-500 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price (e.g. 4.50)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900">
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Quantity in stock"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Emoji (e.g. ☕)"
                    value={form.imageEmoji}
                    onChange={(e) => setForm({ ...form, imageEmoji: e.target.value })}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 text-sm text-stone-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      className="h-4 w-4 rounded border-stone-600 accent-amber-500"
                    />
                    Available for sale
                  </label>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-400 transition-colors"
                  >
                    <Save size={14} />
                    {editingId ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/6 overflow-hidden">
              <div className="bg-white/3 px-5 py-3 border-b border-white/6">
                <h2 className="font-semibold text-sm">Menu Items</h2>
              </div>

              {!menuItems ? (
                <div className="px-5 py-12 text-center text-stone-500 text-sm">
                  Loading…
                </div>
              ) : menuItems.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Package size={32} className="text-stone-700 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm mb-1">No menu items yet</p>
                  <p className="text-stone-600 text-xs">
                    Click &ldquo;Seed Default Items&rdquo; or &ldquo;Add Item&rdquo; to get started.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {menuItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{item.imageEmoji || "☕"}</span>
                          <p className="font-medium text-sm text-white truncate">
                            {item.name}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-stone-500">
                            {item.category}
                          </span>
                          {!item.available && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">
                              Unavailable
                            </span>
                          )}
                          {item.available && item.quantity === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-medium">
                              Out of stock
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 truncate ml-8">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-5 shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-amber-400">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-stone-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
