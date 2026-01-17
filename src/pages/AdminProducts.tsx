import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const adminEmail = "sibabeauty27@gmail.com";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    size: "",
    image: "",
    stock: "",
    badge: "",
  });
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email?.toLowerCase() !== adminEmail) {
        navigate("/login");
        return;
      }
      setAuthorized(true);
      await loadProducts();
    });
    return () => unsub();
  }, [navigate]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      const list: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
      setProducts(list);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "", size: "", image: "", stock: "", badge: "" });
    setFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async (): Promise<string | null> => {
    if (!file) {
      return null;
    }
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const folder = import.meta.env.VITE_CLOUDINARY_FOLDER;
    if (!cloudName || !preset) {
      toast.error("Cloudinary is not configured. Please set cloud name and upload preset.");
      return null;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", preset);
      if (folder) fd.append("folder", folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || "Unknown Cloudinary error";
        console.error("Cloudinary upload failed:", msg, data);
        toast.error(`Upload failed: ${msg}`);
        return null;
      }
      if (data.secure_url) {
        // Update form and preview with final Cloudinary URL
        setForm((f) => ({ ...f, image: data.secure_url }));
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(data.secure_url);
        return data.secure_url as string;
      } else {
        console.error("No secure_url in Cloudinary response:", data);
        toast.error("Upload failed: No URL returned by Cloudinary");
        return null;
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Network error during upload. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const name = form.name.trim();
      const priceNum = Number(form.price);
      if (!name || !form.category || !form.size || Number.isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please fill in name, a valid price (> 0), category and size");
        return;
      }
      // Image must be uploaded and ready (no placeholder)
      let imageUrl = form.image;
      const isCloudinary = (u: string) => u?.startsWith("https://res.cloudinary.com/");
      if (file && !isCloudinary(form.image)) {
        const uploadedUrl = await handleUpload();
        if (!uploadedUrl) {
          // handleUpload already shows detailed error toast
          return;
        }
        imageUrl = uploadedUrl;
      }
      if (!imageUrl || imageUrl.includes("/placeholder")) {
        toast.error("Please upload a product image before saving.");
        return;
      }

      const payload: any = {
        name,
        description: form.description.trim(),
        price: priceNum,
        category: form.category,
        size: form.size,
        image: imageUrl,
      };
      if (form.stock !== "" && !Number.isNaN(Number(form.stock))) payload.stock = Number(form.stock);
      if (form.badge && form.badge.trim()) payload.badge = form.badge.trim();
      await addDoc(collection(db, "products"), payload);
      toast.success("Product added");
      setIsAddOpen(false);
      resetForm();
      await loadProducts();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add product");
    }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      category: p.category || "",
      size: p.size || "",
      image: p.image || "",
      stock: String(p.stock ?? ""),
      badge: p.badge || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const name = form.name.trim();
      const priceNum = Number(form.price);
      if (!name || !form.category || !form.size || Number.isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please fill in name, a valid price (> 0), category and size");
        return;
      }
      let imageUrl = form.image;
      const isCloudinary = (u: string) => u?.startsWith("https://res.cloudinary.com/");
      if (file && !isCloudinary(form.image)) {
        const uploadedUrl = await handleUpload();
        if (!uploadedUrl) {
          // handleUpload already shows detailed error toast
          return;
        }
        imageUrl = uploadedUrl;
      }
      if (!imageUrl || imageUrl.includes("/placeholder")) {
        toast.error("Please upload a product image before updating.");
        return;
      }

      const payload: any = {
        name,
        description: form.description.trim(),
        price: priceNum,
        category: form.category,
        size: form.size,
        image: imageUrl,
      };
      if (form.stock) payload.stock = Number(form.stock);
      if (form.badge && form.badge.trim()) payload.badge = form.badge.trim();
      await updateDoc(doc(db, "products", editing.id), payload);
      toast.success("Product updated");
      setIsEditOpen(false);
      setEditing(null);
      resetForm();
      await loadProducts();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted");
      await loadProducts();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Manage Products</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <Button variant="secondary" onClick={() => navigate("/admin")} className="w-full sm:w-auto">Back to Dashboard</Button>
            <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto">Add Product</Button>
            <Button variant="outline" onClick={loadProducts} disabled={loading} className="w-full sm:w-auto">{loading ? "Loading..." : "Reload"}</Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Products list */}
        {products.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">No products yet. Use "Add Product" to create one.</Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Card key={p.id} className="p-4 flex flex-col gap-3">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-md" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.category} • {p.size}</p>
                  </div>
                  <p className="font-bold">R{p.price}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Product Dialog */}
        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if (!o) resetForm(); }}>
          <DialogContent className="w-[95vw] sm:max-w-lg sm:w-auto max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (R)</Label>
                  <Input type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["Moisturizers","Serums","Face Oils","Night Care","Cleansers","Toners","Sunscreens","Eye Care","Masks","Exfoliators","Body Care","Lip Care","Tools","Other"].map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={form.size} onValueChange={(val) => setForm({ ...form, size: val })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      {["10ml","15ml","20ml","30ml","50ml","75ml","100ml","150ml","200ml","250ml","500ml","1L","Other"].map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Badge (optional)</Label>
                <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Product Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  if (previewUrl && previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setPreviewUrl(f ? URL.createObjectURL(f) : null);
                  if (f) {
                    // Auto-upload on selection so Save can use the final Cloudinary URL
                    void handleUpload();
                  }
                }} />
                <div className="flex items-center gap-3">
                  {(previewUrl || (form.image && !form.image.includes("/placeholder"))) ? (
                    <img src={previewUrl ?? form.image} alt="Preview" className="w-20 h-20 object-cover rounded-md border" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image selected</span>
                  )}
                  {form.image && !form.image.includes("/placeholder") && <a href={form.image} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open</a>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={uploading}>Cancel</Button>
                {uploading && (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                )}
                <Button onClick={handleAdd} disabled={uploading || !form.name.trim() || Number.isNaN(Number(form.price)) || Number(form.price) <= 0 || !form.category || !form.size}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(o) => { setIsEditOpen(o); if (!o) { setEditing(null); resetForm(); } }}>
          <DialogContent className="w-[95vw] sm:max-w-lg sm:w-auto max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (R)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["Moisturizers","Serums","Face Oils","Night Care","Cleansers","Toners","Sunscreens","Eye Care","Masks","Exfoliators","Body Care","Lip Care","Tools","Other"].map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={form.size} onValueChange={(val) => setForm({ ...form, size: val })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      {["10ml","15ml","20ml","30ml","50ml","75ml","100ml","150ml","200ml","250ml","500ml","1L","Other"].map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Badge (optional)</Label>
                <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Product Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  if (previewUrl && previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setPreviewUrl(f ? URL.createObjectURL(f) : null);
                  if (f) {
                    // Auto-upload on selection so Update can use the final Cloudinary URL
                    void handleUpload();
                  }
                }} />
                <div className="flex items-center gap-3">
                  {(previewUrl || (form.image && !form.image.includes("/placeholder"))) ? (
                    <img src={previewUrl ?? form.image} alt="Preview" className="w-20 h-20 object-cover rounded-md border" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image selected</span>
                  )}
                  {form.image && !form.image.includes("/placeholder") && (
                    <a href={form.image} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open</a>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsEditOpen(false)} disabled={uploading}>Cancel</Button>
                {uploading && (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                )}
                <Button onClick={handleUpdate} disabled={uploading || !form.name.trim() || Number.isNaN(Number(form.price)) || Number(form.price) <= 0 || !form.category || !form.size}>Update</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminProducts;