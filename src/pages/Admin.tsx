import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getCountFromServer, query } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Package, ShoppingBag, Database } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({ products: 0, orders: 0, stock: 0 });
  const adminEmail = "sibabeauty27@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email?.toLowerCase() !== adminEmail) {
        navigate("/login");
        return;
      }
      setAuthorized(true);
      // Fetch counts
      try {
        const productsSnap = await getCountFromServer(query(collection(db, "products")));
        const ordersSnap = await getCountFromServer(query(collection(db, "orders")));
        setStats({ products: productsSnap.data().count, orders: ordersSnap.data().count, stock: 0 });
      } catch (err) {
        console.error(err);
      }
    });
    return () => unsub();
  }, [navigate]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Admin Dashboard</h1>
          <Button variant="secondary" onClick={() => navigate("/")}>Back to Shop</Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">{stats.orders}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="text-2xl font-bold">{stats.stock}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Analytics</p>
                <p className="text-2xl font-bold">Coming Soon</p>
              </div>
            </div>
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Manage Products</h2>
          <Button onClick={() => navigate("/admin/products")}>Go to Products</Button>
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Manage Sales</h2>
          <Button onClick={() => navigate("/admin/sales")}>Go to Sales</Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;