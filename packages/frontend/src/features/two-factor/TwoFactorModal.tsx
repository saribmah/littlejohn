import { useState, useEffect } from 'react';
import { twoFactorService } from './service';
import type { TwoFactorAuth } from './types';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [existingCode, setExistingCode] = useState<TwoFactorAuth | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing 2FA code when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExisting2FA();
    }
  }, [isOpen]);

  const loadExisting2FA = async () => {
    try {
      const response = await twoFactorService.get2FA();
      if (response.twoFactor) {
        setExistingCode(response.twoFactor);
        setCode(response.twoFactor.code);
      }
    } catch (error) {
      console.error('Failed to load 2FA code:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter a 2FA code' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await twoFactorService.save2FA(code);
      setExistingCode(response.twoFactor);
      setMessage({
        type: 'success',
        text: existingCode ? '2FA code updated successfully' : '2FA code saved successfully'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save 2FA code'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your 2FA code?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await twoFactorService.delete2FA();
      setExistingCode(null);
      setCode('');
      setMessage({ type: 'success', text: '2FA code removed successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete 2FA code'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Add your Robinhood 2FA backup code to enable automated portfolio syncing.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-300 mb-2">
                2FA Backup Code
              </label>
              <input
                id="2fa-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your 2FA backup code"
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-md text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                This code will be used to authenticate with Robinhood during automated syncs.
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-500 bg-opacity-10 text-green-400 border border-green-500 border-opacity-20'
                    : 'bg-red-500 bg-opacity-10 text-red-400 border border-red-500 border-opacity-20'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Saving...' : existingCode ? 'Update Code' : 'Save Code'}
              </button>

              {existingCode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </form>

          {existingCode && (
            <div className="mt-6 p-4 bg-black border border-gray-800 rounded-md">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Current Status</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="text-green-400">Configured</span>
                </p>
                <p>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(existingCode.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
