import robotImageSrc from "../../../../assets/Finixa robot.png";
import { cn } from "../../../../shared/ui/types";

type AuthIllustrationVariant = "default" | "compact";

type AuthIllustrationProps = {
  className?: string;
  variant?: AuthIllustrationVariant;
};

const variantClasses: Record<AuthIllustrationVariant, string> = {
  default:
    "right-[-6%] top-1/2 w-[420px] max-w-[40vw] -translate-y-1/2",

  compact:
    "right-[-4%] top-[46%] w-[360px] max-w-[34vw] -translate-y-1/2",
};

export default function AuthIllustration({
  className,
  variant = "default",
}: AuthIllustrationProps) {
  return (
    <img
      src={robotImageSrc}
      alt=""
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute hidden opacity-95 xl:block",
        variantClasses[variant],
        className,
      )}
    />
  );
}