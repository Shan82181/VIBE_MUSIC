import React from "react";
import { toast } from "react-toastify";

class PlayerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Trigger fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Log the error
  componentDidCatch(error, errorInfo) {
    console.error("🔥 Player Crashed:", error, errorInfo);
    toast.error("Player encountered an error.");
  }

  // Spotify-style reload behavior
  handleReload = () => {
    try {
      // Reset Zustand player store (passed as prop)
      if (typeof this.props.resetPlayer === "function") {
        this.props.resetPlayer();
      }

      // Remove error state so UI can re-render
      this.setState({ hasError: false });

      toast.success("Player reloaded successfully.");
    } catch (err) {
      console.error("Reload error:", err);
      toast.error("Failed to reload player.");
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-neutral-900 text-white p-4 text-center border-t border-neutral-700">
          <span>Player failed — </span>
          <button
            onClick={this.handleReload}
            className="underline ml-1 text-blue-400 hover:text-blue-300"
          >
            Reload Player
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlayerErrorBoundary;
