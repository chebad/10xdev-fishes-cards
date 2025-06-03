import type { PrivacyPolicyLinkProps } from "@/types";

export function PrivacyPolicyLink({ href, children }: PrivacyPolicyLinkProps) {
  return (
    <a
      href={href}
      className="text-primary underline hover:text-primary/80 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 rounded-sm transition-colors duration-200"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children || "polityki prywatności"}
    </a>
  );
}
