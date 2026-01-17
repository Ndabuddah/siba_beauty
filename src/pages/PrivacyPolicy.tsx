import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Introduction</h2>
          <p className="text-muted-foreground mt-2">
            We respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you interact with our website and services.
          </p>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
            <li>Contact details such as name, email address, phone number</li>
            <li>Delivery address and order details</li>
            <li>Payment information processed securely through third-party providers (we do not store card details)</li>
            <li>Usage data such as page interactions and preferences to improve the experience</li>
          </ul>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
            <li>To process orders and deliver products to you</li>
            <li>To communicate order updates and support</li>
            <li>To improve our products and website experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Data Protection</h2>
          <p className="text-muted-foreground mt-2">
            We implement reasonable security measures to protect your information. Payments are handled by trusted payment processors, and we never store full card details.
          </p>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Your Rights</h2>
          <p className="text-muted-foreground mt-2">
            You may request access, correction, or deletion of your personal data. For any privacy-related requests, please contact us at Sibabeauty27@gmail.com.
          </p>
        </section>
        <Separator />

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground mt-2">
            If you have questions about this policy, contact us at Sibabeauty27@gmail.com or 076 801 8129.
          </p>
        </section>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;