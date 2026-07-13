'use client';

import { Step, StepLabel, Stepper } from '@mui/material';

interface UploadStepperProps {
  activeStep: number;
}

const steps = ['Upload PDF', 'Metadata Artikel'];

export default function UploadStepper({ activeStep }: UploadStepperProps) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        width: '100%',
        py: 2,
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
