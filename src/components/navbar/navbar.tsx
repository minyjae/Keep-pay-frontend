import { Button } from "../ui/button"
import Logo from "../logo/logo"
import type { VariantProps } from "class-variance-authority"

type NavbarProps = {
  title?: string
  buttonLabel?: string
  buttonSize?: VariantProps<typeof import("../ui/button").buttonVariants>["size"]
  buttonVariant?: VariantProps<typeof import("../ui/button").buttonVariants>["variant"]
  logoWidth?: number | string
  logoHeight?: number | string
  logoClassName?: string
}

export default function Navbar({
  buttonLabel = "Login",
  buttonSize = "default",
  buttonVariant = "outline",
  logoWidth = 50,
  logoHeight = 50,
  logoClassName = "",
}: NavbarProps) {
  return (
    <div className="bg-black flex flex-row justify-between items-center h-20 px-4 py-4 shadow-sm shadow-white/30">
      <div className="h-12">
        <Logo width={logoWidth} height={logoHeight} className={logoClassName} />
      </div>
      <Button size={buttonSize} variant={buttonVariant}>
        {buttonLabel}
      </Button>
    </div>
  )
}
