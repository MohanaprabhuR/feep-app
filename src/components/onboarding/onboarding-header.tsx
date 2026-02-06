import { UserRound } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";

type OnboardingHeaderProps = {
  step?: number;
  title: string;
  percentCompleted?: number;
  totalSteps?: number;
};

const OnboardingHeader = ({
  step,
  title,
  percentCompleted,
  totalSteps = 4,
}: OnboardingHeaderProps) => {
  const pathname = usePathname();
  const inferredStep = React.useMemo(() => {
    if (!pathname) return undefined;
    const match = pathname.match(/\/onboarding\/step-(\d+)/);
    return match ? Number(match[1]) : undefined;
  }, [pathname]);
  const displayStep = step ?? inferredStep ?? 1;
  const showPercent = typeof percentCompleted === "number";
  return (
    <div className="px-5 py-4 border-b border-border w-full flex justify-between items-center">
      <div className="flex items-center gap-3">
        <UserRound className="size-12 text-muted-foreground" />
        <div>
          <p className="text-base font-medium tracking-4 leading-6 text-muted-foreground">
            Step {displayStep} / {totalSteps}
          </p>
          <p className="text-lg font-medium tracking-4 leading-6 text-accent-foreground">{title}</p>
        </div>
      </div>
      {showPercent ? (
        <p className="text-base font-medium tracking-4 leading-6 text-muted-foreground">
          {percentCompleted}% Completed
        </p>
      ) : (
        <span />
      )}
    </div>
  );
};

export default OnboardingHeader;
