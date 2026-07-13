import { useMutation } from '@tanstack/react-query';

import {
  storeOtherSource,
  StoreOtherSourcePayload,
} from '@/clients/otherSource';

export const useStoreOtherSource = () =>
  useMutation({
    mutationFn: ({
      researchPlanId,
      payload,
    }: {
      researchPlanId: number;
      payload: StoreOtherSourcePayload;
    }) => storeOtherSource(researchPlanId, payload),
  });
