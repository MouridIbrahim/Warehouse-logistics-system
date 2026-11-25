export function WorkflowProgress({
  steps,
  currentStep,
}: {
  steps: string[]
  currentStep: number
}) {
  return (
    <ol aria-label="Workflow progress" className={`mb-6 grid gap-2 ${steps.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isCurrent = stepNumber === currentStep
        const isComplete = stepNumber < currentStep

        return (
          <li
            key={label}
            aria-current={isCurrent ? 'step' : undefined}
            className={`border-b-2 pb-2 text-caption-meta ${
              isCurrent
                ? 'border-primary font-semibold text-primary'
                : isComplete
                  ? 'border-status-success text-text-primary'
                  : 'border-border-default text-text-secondary'
            }`}
          >
            <span className="mr-1.5 tabular-nums">{isComplete ? '✓' : stepNumber}</span>
            {label}
          </li>
        )
      })}
    </ol>
  )
}
