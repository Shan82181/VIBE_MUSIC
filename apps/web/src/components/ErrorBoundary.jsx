import { useState, useEffect } from "react";

export function ErrorBoundary({ error }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (error) setVisible(true);
  }, [error]);

  if (!visible || !error) return null;

  return (
    <div className="bg-red-900/40 text-red-200 px-4 py-3 rounded-md mt-4">
      <strong>Error:</strong> {error}
    </div>
  );
}
