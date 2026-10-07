import { Component, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { DonateEventModel } from "../../models/DonateEvent";
import { messageReadingMs } from "../../donations/runMotionDonation";

function ReadableFallback({ donate, netAmount }: { donate: DonateEventModel; netAmount: number }) {
  const message = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = messageReadingMs(donate.message);
    const scroll = () => {
      const elapsed = performance.now() - start;
      const overflow = message.current.scrollHeight - message.current.clientHeight;
      message.current.scrollTop =
        Math.max(0, overflow) *
        Math.min(1, Math.max(0, (elapsed - 2500) / Math.max(1, duration - 5000)));
      if (elapsed < duration && overflow > 0) raf = requestAnimationFrame(scroll);
    };
    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [donate.message]);
  return (
    <div className="motion-readable-fallback">
      <div className="information-header">
        <strong>{donate.nickname || "Anonim"}</strong>
        <span>
          {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
            netAmount / 100,
          )}
        </span>
      </div>
      <div ref={message} className="information-message">
        {donate.message || "Dzięki za wsparcie!"}
      </div>
    </div>
  );
}

/** A render/effect exception cannot tear down PageChannel or its live queue. */
export class SceneErrorBoundary extends Component<
  { children: ReactNode; donate: DonateEventModel; netAmount: number },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.warn("Donation scene failed; preserving readable content and completion", error);
  }
  render() {
    return this.state.failed ? (
      <ReadableFallback donate={this.props.donate} netAmount={this.props.netAmount} />
    ) : (
      this.props.children
    );
  }
}
