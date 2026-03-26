import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface Step {
  id: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <div className="relative flex flex-1 flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  disabled={isPending}
                  className={`
                    relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300
                    ${isCompleted 
                      ? "bg-primary text-white" 
                      : isCurrent 
                        ? "border-2 border-primary bg-white text-primary dark:bg-gray-900" 
                        : "border-2 border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900"
                    }
                    ${onStepClick && !isPending ? "cursor-pointer hover:scale-105" : "cursor-default"}
                  `}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent 
                      ? "text-primary" 
                      : isCompleted 
                        ? "text-gray-700 dark:text-gray-300" 
                        : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="relative flex-1">
                  <div
                    className={`absolute left-0 right-0 top-5 h-0.5 transition-all duration-300 ${
                      isCompleted 
                        ? "bg-primary" 
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;