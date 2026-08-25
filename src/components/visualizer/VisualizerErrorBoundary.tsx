"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class VisualizerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Visualizer 3D preview failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[380px] rounded-2xl bg-[#EDE6DA] border border-[#E8DDD0] text-center px-6">
          <p className="text-[#78716C] text-sm">
            3D preview isn't available right now. Please refresh the page or try again shortly.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VisualizerErrorBoundary;
