"use client";

export default function NeonAvatar() {
  return (
    <div className="na-wrap">
      <div className="na-tilt">
        <div className="na-core">
          <div className="na-ring na-ring-1" />
          <div className="na-ring na-ring-2" />
          <div className="na-ring na-ring-3" />
          <div className="na-chip" />
          <div className="na-face">
            <div className="na-eye na-eye-l" />
            <div className="na-eye na-eye-r" />
            <div className="na-smile" />
          </div>
        </div>
      </div>
    </div>
  );
}