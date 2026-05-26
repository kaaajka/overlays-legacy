export type DonationQueueState<TDonate> = {
  donateList: readonly TDonate[];
  currentDonate: TDonate | undefined;
  donateAlertQueue: readonly string[];
  currentDonateAlert: string | undefined;
};

export type DonationQueueTransition<TDonate> = {
  state: DonationQueueState<TDonate>;
  shouldScheduleDonationChange: boolean;
  acceptAlertId?: string;
};

function transition<TDonate>(
  state: DonationQueueState<TDonate>,
  options: {
    shouldScheduleDonationChange?: boolean;
    acceptAlertId?: string;
  } = {},
): DonationQueueTransition<TDonate> {
  return {
    state,
    shouldScheduleDonationChange: options.shouldScheduleDonationChange ?? false,
    acceptAlertId: options.acceptAlertId,
  };
}

export function resolveDonationQueuePush<TDonate>(
  state: DonationQueueState<TDonate>,
  donate: TDonate,
): DonationQueueTransition<TDonate> {
  return transition(
    {
      ...state,
      donateList: [...state.donateList, donate],
    },
    { shouldScheduleDonationChange: !state.currentDonate },
  );
}

export function resolveDonationQueueFinished<TDonate>(
  state: DonationQueueState<TDonate>,
): DonationQueueTransition<TDonate> {
  if (!state.currentDonate) return transition(state);

  return transition(
    {
      ...state,
      donateList: state.donateList.slice(1),
      currentDonate: undefined,
    },
    { shouldScheduleDonationChange: true },
  );
}

export function resolveDonationQueueScheduledChange<TDonate>(
  state: DonationQueueState<TDonate>,
  { submitFirstAlert = false }: { submitFirstAlert?: boolean } = {},
): DonationQueueTransition<TDonate> {
  const nextState: DonationQueueState<TDonate> = {
    ...state,
    currentDonate: state.donateList[0],
  };

  if (!submitFirstAlert) return transition(nextState);

  return resolveDonationQueueSubmitFirstAlert({
    ...nextState,
    currentDonateAlert: undefined,
  });
}

export function resolveDonationQueueSubmitFirstAlert<TDonate>(
  state: DonationQueueState<TDonate>,
): DonationQueueTransition<TDonate> {
  if (state.currentDonateAlert || state.donateAlertQueue.length === 0) {
    return transition(state);
  }

  const acceptAlertId = state.donateAlertQueue[0];

  return transition(
    {
      ...state,
      currentDonateAlert: acceptAlertId,
    },
    { acceptAlertId },
  );
}
