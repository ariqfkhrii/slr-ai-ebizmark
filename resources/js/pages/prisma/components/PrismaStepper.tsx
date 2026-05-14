import { Box, Typography } from '@mui/material';

const steps = ['Identification', 'Screening', 'Retrieval', 'Report'];

type Props = {
  activeStep?: number;
};

export default function PrismaStepper({ activeStep = 0 }: Props) {
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

        let bgColor = '#c7c7c7';
        let textColor = '#666';

        if (isCompleted) {
          bgColor = '#22c55e';
          textColor = '#fff';
        }

        if (isActive) {
          bgColor = '#2563eb';
          textColor = '#fff';
        }

        return (
          <Box
            key={step}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* GARIS */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '55%',
                  right: '-45%',
                  height: 2,
                  bgcolor: index < activeStep ? '#22c55e' : '#d1d5db',
                  transform: 'translateY(-50%)',
                  zIndex: 0,
                }}
              />
            )}

            {/* STEP */}
            <Box
              sx={{
                width: '100%',
                maxWidth: 220,
                py: 1.2,
                px: 2,
                borderRadius: 999,
                textAlign: 'center',
                bgcolor: bgColor,
                color: textColor,
                boxShadow: isActive ? '0 3px 10px rgba(37,99,235,.35)' : 'none',
                transition: 'all .2s ease',
                zIndex: 1,
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
