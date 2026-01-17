import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SIBA BEAUTY
            </h3>
            <p className="text-sm text-muted-foreground">
              Premium skincare formulated with natural ingredients for radiant, healthy skin.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1A6qUpTTs8/?mibextid=wwXIfr" className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noreferrer">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/sibabeauty_27?igsh=czkxNnprazVicXdu&utm_source=qr" className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noreferrer">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@sibabeauty_27?_r=1&_d=dm7i4232lc6dg7&sec_uid=MS4wLjABAAAAKJ7MsmhDis3twBWApXvQW_npW-MwUpIpTk-QO03s6ogLhf8dy4jQ6ogQz4HBNuic&share_author_id=7373175477207647238&sharer_language=en&source=h5_m&u_code=eea814cl2dg7d7&item_author_type=1&utm_source=copy&tt_from=copy&enable_checksum=1&utm_medium=ios&share_link_id=9C0EDB90-FAE1-4D0E-8B62-11D7D0296214&user_id=7373175477207647238&sec_user_id=MS4wLjABAAAAKJ7MsmhDis3twBWApXvQW_npW-MwUpIpTk-QO03s6ogLhf8dy4jQ6ogQz4HBNuic&social_share_type=4&ug_btm=b8727,b0&utm_campaign=client_share&share_app_id=1233" className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noreferrer">
                <SiTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground">South Africa</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:0768018129" className="text-muted-foreground hover:text-primary transition-colors">
                  076 801 8129
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-1" />
                <a 
                  href="mailto:Sibabeauty27@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors break-all"
                >
                  Sibabeauty27@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SiBA BEAUTY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
