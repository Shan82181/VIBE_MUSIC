import React from "react";

class LikeButtonErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("💔 LikeButton crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Spotify-like minimal fallback
      return (
        <span title="Like unavailable" className="text-yellow-400">
          ⚠️
        </span>
      );
    }

    return this.props.children;
  }
}

export default LikeButtonErrorBoundary;
