import robotImageSrc from "../../../../assets/Finixa robot.png";
import { cn } from "../../../../shared/ui/types";

type AuthIllustrationProps = {
  className?: string;
};

export default function AuthIllustration({ className }: AuthIllustrationProps) {
  return (
    <img
      src={robotImageSrc}
      alt=""
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute right-[-6%] top-1/2 hidden w-[420px] max-w-[40vw] -translate-y-1/2 opacity-95 xl:block",
        className,
      )}
    />
  );
}
