import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <Image
            src="/brand/logo-white.webp"
            alt="PHT"
            width={110}
            height={36}
            className="site-footer__logo"
          />
          <p className="muted">
            Ganzheitliche Hygienelösungen für die Lebensmittelbranche. Sicher
            aus Erfahrung.
          </p>
        </div>
        <div className="site-footer__links">
          <Link href="/shop?category=Personalhygiene">Personalhygiene</Link>
          <Link href="/shop?category=Betriebshygiene">Betriebshygiene</Link>
          <Link href="/shop?category=Prozesstechnik">Prozesstechnik</Link>
          <Link href="/shop?category=Service">Service</Link>
          <Link href="/demo">Demo-Leitfaden</Link>
          <Link href="/account">Mein Konto</Link>
        </div>
        <div className="site-footer__meta">
          <p>PHT Deutschland Süd · Bad Tölz</p>
          <p>PHT Deutschland Nord · Beckum</p>
          <p className="muted">Demo-Shop — nicht der Live-Betrieb</p>
        </div>
      </div>
    </footer>
  );
}
