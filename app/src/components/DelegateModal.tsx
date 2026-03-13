"use client";

/**
 * Delegation modal — lets users delegate their voting power.
 * TODO issue #47: wire to VotesClient.delegate() with connected wallet.
 */

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DelegateModal({ open, onClose }: Props) {
  const [delegatee, setDelegatee] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleDelegate(e: React.FormEvent) {
    e.preventDefault();
    if (!delegatee.trim()) return;
    setSubmitting(true);
    try {
      // TODO issue #47: call VotesClient.delegate(signer, delegatee)
      console.log("Delegating to:", delegatee);
      await new Promise((r) => setTimeout(r, 1000));
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Delegate Voting Power
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Delegate to yourself to activate your voting power, or choose another
          address.
        </p>

        <form onSubmit={handleDelegate} className="space-y-4">
          <input
            type="text"
            placeholder="Stellar address (G...)"
            value={delegatee}
            onChange={(e) => setDelegatee(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            required
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Delegating..." : "Delegate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
