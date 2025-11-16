import { useState, useEffect } from 'react';
import { twoFactorService } from './service';
import type { TwoFactorAuth } from './types';

export function TwoFactorSetup() {
  const [code, setCode] = useState('');
  const [existingCode, setExistingCode] = useState<TwoFactorAuth | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing 2FA code
  useEffect(() => {
    loadExisting2FA();
  }, []);

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
      <p className="text-gray-600 mb-6">
        Add your Robinhood 2FA backup code to enable automated portfolio syncing.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-700 mb-2">
            2FA Backup Code
          </label>
          <input
            id="2fa-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your 2FA backup code"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : existingCode ? 'Update Code' : 'Save Code'}
          </button>

          {existingCode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove Code
            </button>
          )}
        </div>
      </form>

      {existingCode && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className="text-green-600">Configured</span>
            </p>
            <p>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(existingCode.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
