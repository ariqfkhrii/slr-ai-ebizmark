import { Box, Typography } from '@mui/material';

const steps = ['Identification', 'Screening', 'Retrieval', 'Report'];

type Props = {
  activeStep?: number;
  canOpenScreening?: boolean;
  canOpenRetrieval?: boolean;
  onStepClick?: (step: number) => void;
};

export default function PrismaStepper({
  activeStep = 0,
  canOpenScreening = false,
  canOpenRetrieval = false,
  onStepClick,
}: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        gap: 4,
        width: '100%',
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const isIdentification = index === 0;
        const isScreening = index === 1;
        const isRetrieval = index === 2;

        const isUnlocked =
          isIdentification ||
          (isScreening && canOpenScreening) ||
          (isRetrieval && canOpenRetrieval);

        const isClickable = isUnlocked;

        let bgColor = '#c7c7c7';
        let textColor = '#666';
        let shadow = 'none';

        if (isUnlocked) {
          bgColor = '#f59e0b';
          textColor = '#fff';
        }

        if (isCompleted) {
          bgColor = '#22c55e';
          textColor = '#fff';
        }

        if (isActive) {
          bgColor = '#2563eb';
          textColor = '#fff';
          shadow = '0 3px 10px rgba(37,99,235,.35)';
        }

        const lineColor = (() => {
          if (index === 0) {
            if (activeStep >= 1) return '#22c55e';
            if (canOpenScreening) return '#f59e0b';
          }

          if (index < activeStep) return '#22c55e';

          return '#d1d5db';
        })();

        return (
          <Box
            key={step}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 'calc(50% + 110px)',
                  right: 'calc(-59% + 110px)',
                  height: 2,
                  bgcolor: lineColor,
                  transform: 'translateY(-50%)',
                  zIndex: 0,
                }}
              />
            )}

            <Box
              onClick={() => {
                if (!isClickable) return;
                onStepClick?.(index);
              }}
              sx={{
                width: '100%',
                maxWidth: 220,
                py: 1.2,
                px: 2,
                borderRadius: 999,
                textAlign: 'center',
                bgcolor: bgColor,
                color: textColor,
                boxShadow: shadow,
                transition: 'all .2s ease',
                zIndex: 2,
                position: 'relative',
                cursor: isClickable ? 'pointer' : 'not-allowed',
                opacity: isUnlocked || isActive || isCompleted ? 1 : 0.55,

                '&:hover': isClickable
                  ? {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(37,99,235,.28)',
                    }
                  : {},
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  letterSpacing: '.5px',
                }}
              >
                {step}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
