"use client";
import React from "react";

/**
 * HackButton compatibility wrapper.
 * Accepts any of:
 *   - target?: string
 *   - defenderUid?: string
 *   - defenderId?: string
 * Also accepts:
 *   - className?: string
 *   - onAfter?: () => void   (called after the action completes)
 *
 * Keeps behavior minimal; replace with your full implementation later.
 */
type Props = {
  target?: string;
  defenderUid?: string;
  defenderId?: string;
  className?: string;
  onAfter?: () => void;
};

export default function HackButton({ target, defenderUid, defenderId, className = "", onAfter }: Props) {
  const actualTarget = target ?? defenderUid ?? defenderId;
  if (!actualTarget) {
    return (
      <button disabled className={`px-3 py-2 rounded-md opacity-50 ${className}`}>
        Hack
      </button>
    );
  }

  const handleClick = async () => {
    try {
      // placeholder: integrate your RPC call here
      // e.g. await supabase.rpc('rpc_hack_attempt', { p_target: actualTarget })
      console.log("Hack clicked for", actualTarget);

      // simulate async call (remove if you call real RPC)
      // await new Promise((r) => setTimeout(r, 200));

      // call onAfter callback if provided
      if (typeof onAfter === "function") {
        try { onAfter(); } catch (e) { console.error("onAfter callback error", e); }
      }
    } catch (e) {
      console.error("HackButton error", e);
      // still call onAfter if present to allow UI to recover
      if (typeof onAfter === "function") {
        try { onAfter(); } catch (ee) { console.error("onAfter callback error", ee); }
      }
    }
  };

  return (
    <button onClick={handleClick} className={`px-3 py-2 rounded-md hover:scale-[1.02] transition ${className}`}>
      Hack
    </button>
  );
}