import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Sale, SaleType } from "@/types/sale";

const AdminSales = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const adminEmail = "sibabeauty27@gmail.com";

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "percent" as SaleType,
    percent: "10",
    amount: "",
    active: true,
    start: "",
    end: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email?.toLowerCase() !== adminEmail) {
        navigate("/login");
        return;
      }
      setAuthorized(true);
      await loadSales();
    });
    return () => unsub();
  }, [navigate]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "sales"));
      const list: Sale[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sale, "id">) }));
      setSales(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", type: "percent", percent: "10", amount: "", active: true, start: "", end: "" });
  };

  const handleAdd = async () => {
    try {
      const title = form.title.trim();
      if (!title) { toast.error("Please enter a title"); return; }
      const payload: any = { title, type: form.type, active: form.active, createdAt: Date.now() };
      if (form.type === "percent") {
        const pct = Number(form.percent);
        if (Number.isNaN(pct) || pct <= 0 || pct > 100) { toast.error("Enter a valid percent (1-100)"); return; }
        payload.percent = pct;
      } else {
        const amt = Number(form.amount);
        if (Number.isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount (> 0)"); return; }
        payload.amount = amt;
      }
      if (form.start) payload.startDate = new Date(form.start).getTime();
      if (form.end) payload.endDate = new Date(form.end).getTime();
      await addDoc(collection(db, "sales"), payload);
      toast.success("Sale created");
      setIsAddOpen(false);
      resetForm();
      await loadSales();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create sale");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sales", id));
      toast.success("Sale deleted");
      await loadSales();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sale");
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Manage Sales</h1>
          <Button variant="secondary" onClick={() => navigate("/admin")}>Back to Admin</Button>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={() => setIsAddOpen(true)}>Add Sale</Button>
          <Button variant="outline" onClick={loadSales} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {sales.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">Type: {s.type} • Active: {s.active ? "Yes" : "No"}</p>
                  {(s.startDate || s.endDate) && (
                    <p className="text-xs text-muted-foreground">{s.startDate ? new Date(s.startDate).toLocaleDateString() : ""} - {s.endDate ? new Date(s.endDate).toLocaleDateString() : ""}</p>
                  )}
                </div>
                <div className="text-right">
                  {s.type === "fixed" && s.amount ? <p className="font-bold">R{s.amount} off</p> : null}
                  {s.type === "percent" && s.percent ? <p className="font-bold">{s.percent}% off</p> : null}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
              </div>
            </Card>
          ))}
          {sales.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground">No sales yet. Use "Add Sale" to create one.</Card>
          )}
        </div>

        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if (!o) resetForm(); }}>
          <DialogContent className="w-[95vw] sm:max-w-lg sm:w-auto max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val as SaleType })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.type === "fixed" ? (
                  <div className="space-y-2">
                    <Label>Amount (R)</Label>
                    <Input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Percent (%)</Label>
                    <Input type="number" min="1" max="100" step="1" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start (optional)</Label>
                  <Input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End (optional)</Label>
                  <Input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSales;