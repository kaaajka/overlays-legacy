import React from "react";
/** Isolate scene failures while keeping transport, data and recovery controls alive. */
export class PreviewBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Motion Studio preview failure", error);
  }
  render() {
    return this.state.failed ? (
      <div className="preview-error" role="alert">
        Podgląd przerwano. Dane i oś czasu są dostępne.{" "}
        <button type="button" onClick={() => this.setState({ failed: false })}>
          Ponów podgląd
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
