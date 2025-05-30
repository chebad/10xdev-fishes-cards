import type { PrivacyPolicyLinkProps } from "@/types";

export function PrivacyPolicyLink({ href, children }: PrivacyPolicyLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:text-primary/80 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 rounded-sm transition-colors duration-200"
    >
      {children || "polityki prywatności"}
    </a>
  );
}
