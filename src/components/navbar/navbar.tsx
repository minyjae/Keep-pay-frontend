import { Button, buttonVariants } from "../ui/button";
import Logo from "../logo/logo";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";

type NavButton = {
  label: string;
  path: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
  onClick?: () => void;
};

type NavbarProps = {
  buttons: NavButton[];
  logoHref?: string;
  logoWidth?: number | string;
  logoHeight?: number | string;
  logoClassName?: string;
};

export default function Navbar({
  buttons,
  logoHref,
  logoWidth = 36,
  logoHeight = 36,
  logoClassName = "",
}: NavbarProps) {
  const logoContent = (
    <div className="flex items-center gap-2.5">
      <Logo width={logoWidth} height={logoHeight} className={logoClassName} />
      <span className="text-white font-semibold text-sm tracking-tight">
        Keep-pay
      </span>
    </div>
  );

  return (
    <nav className="bg-black border-b border-white/10 flex items-center justify-between h-16 px-6 lg:px-10">
      {logoHref ? (
        <Link href={logoHref}>{logoContent}</Link>
      ) : (
        logoContent
      )}

      <div className="flex items-center gap-3">
        {buttons.map((btn) => (
          <Link key={btn.path} href={btn.path}>
            <Button
              size={btn.size ?? "sm"}
              variant={btn.variant ?? "outline"}
              className="cursor-pointer"
              onClick={btn.onClick}
            >
              {btn.label}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
