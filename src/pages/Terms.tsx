import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Terms & Conditions</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Introduction</h2>
          <p className="text-muted-foreground mt-2">
            These Terms & Conditions govern the use of our website and the purchase of products from SIBA BEAUTY.
          </p>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Orders & Payments</h2>
          <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
            <li>All orders are subject to availability.</li>
            <li>Prices are listed in ZAR and may change without notice.</li>
            <li>Payments are processed securely via trusted third-party providers.</li>
          </ul>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Shipping & Delivery</h2>
          <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
            <li>Standard delivery fee applies unless otherwise stated.</li>
            <li>Free delivery applies to orders over R1000.</li>
            <li>Delivery times may vary based on location and availability.</li>
          </ul>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Returns & Exchanges</h2>
          <p className="text-muted-foreground mt-2">
            For hygiene reasons, skincare products may not be eligible for returns once opened. Please contact us for assistance.
          </p>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Liability</h2>
          <p className="text-muted-foreground mt-2">
            SIBA BEAUTY is not liable for any damages arising from misuse of products. Always follow usage instructions and perform patch tests where applicable.
          </p>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground mt-2">
            For questions regarding these terms, contact us at Sibabeauty27@gmail.com or 076 801 8129.
          </p>
        </section>
      </Card>
    </div>
  );
};

export default Terms;