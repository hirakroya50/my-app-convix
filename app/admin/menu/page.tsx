"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

type MenuForm = {
  name: string;
  price: string;
  description: string;
  available: boolean;
  quantity: string;
};

const emptyForm: MenuForm = {
  name: "",
  price: "",
  description: "",
  available: true,
  quantity: "50",
};

export default function AdminMenuPage() {
  const menuItems = useQuery(api.menu.list);
  const orders = useQuery(api.orders.list);
  const addItem = useMutation(api.menu.add);
  const updateItem = useMutation(api.menu.update);
  const removeItem = useMutation(api.menu.remove);
  const seedMenu = useMutation(api.menu.seed);

  const [editingId, setEditingId] = useState<Id<"menu"> | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (item: {
    _id: Id<"menu">;
    name: string;
    price: number;
    description: string;
    available: boolean;
    quantity: number;
  }) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      available: item.available,
      quantity: item.quantity.toString(),
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
        available: form.available,
        quantity,
      });
      setEditingId(null);
    } else {
      await addItem({
        name: form.name.trim(),
        price,
        description: form.description.trim(),
        available: form.available,
        quantity,
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

  return (
    <div className="min-h-screen bg-[#0a0908] text-stone-100">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0908]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
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
                <h1 className="font-semibold text-sm">Admin Dashboard</h1>
                <p className="text-[11px] text-stone-500">Menu Management</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
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
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Menu Items",
              value: menuItems?.length ?? 0,
              icon: Package,
            },
            {
              label: "Available",
              value: menuItems?.filter((i) => i.available && i.quantity > 0).length ?? 0,
              icon: Coffee,
            },
            {
              label: "Total Orders",
              value: orders?.length ?? 0,
              icon: ShoppingBag,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/6 bg-white/3 p-5"
            >
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

        {/* Add / Edit form */}
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
              <input
                type="number"
                min="0"
                placeholder="Quantity in stock"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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

        {/* Menu items table */}
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
                      <p className="font-medium text-sm text-white truncate">
                        {item.name}
                      </p>
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
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-400">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-stone-600">
                        Qty: {item.quantity}
                      </p>
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

        {/* Recent orders */}
        {orders && orders.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/6 overflow-hidden">
            <div className="bg-white/3 px-5 py-3 border-b border-white/6">
              <h2 className="font-semibold text-sm">Recent Orders</h2>
            </div>
            <div className="divide-y divide-white/5">
              {orders.slice(0, 20).map((order) => (
                <div
                  key={order._id}
                  className="px-5 py-4 hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium uppercase">
                        {order.status}
                      </span>
                      <span className="text-xs text-stone-600">
                        {new Date(order.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-amber-400">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-stone-400"
                      >
                        {item.quantity}× {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
