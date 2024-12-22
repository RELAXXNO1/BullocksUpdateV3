import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Promo } from '../../types/promo';
import { PROMO_TYPES } from '../../types/promo';
import { Button } from '../ui/Button';

interface PromoFormProps {
  onSubmit: (data: Partial<Promo>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<Promo>;
}

export function PromoForm({ onSubmit, onClose, initialData }: PromoFormProps) {
  const [formData, setFormData] = useState<Partial<Promo>>(initialData || {
    name: '',
    description: '',
    product: '', 
    discount: 0,
    startDate: new Date(),
    endDate: new Date(),
    type: 'percentage',
    isActive: true,
    code: '',
    maxUses: undefined,
    minPurchaseAmount: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-dark-600 rounded-xl shadow-xl w-full max-w-lg my-4 sm:my-8 relative"
      >
        <div className="p-6 border-b border-dark-400">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {initialData ? 'Edit Promotion' : 'Create New Promotion'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg bg-dark-500 border-dark-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-dark-500 border-dark-400"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Type</label>
              <select
                value={formData.type || 'percentage'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Promo['type'] })}
                className="w-full rounded-lg bg-dark-500 border-dark-400"
              >
                {PROMO_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Discount</label>
              <input
                type="number"
                value={formData.discount || ''}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="w-full rounded-lg bg-dark-500 border-dark-400"
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="w-full rounded-lg bg-dark-500 border-dark-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                className="w-full rounded-lg bg-dark-500 border-dark-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Promo Code</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full rounded-lg bg-dark-500 border-dark-400"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Max Uses</label>
              <input
                type="number"
                value={formData.maxUses || ''}
                onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) || undefined })}
                className="w-full rounded-lg bg-dark-500 border-dark-400"
                min="0"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Minimum Purchase Amount</label>
            <input
              type="number"
              value={formData.minPurchaseAmount || ''}
              onChange={(e) => setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) || undefined })}
              className="w-full rounded-lg bg-dark-500 border-dark-400"
              min="0"
              step="0.01"
              placeholder="Optional"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-dark-400 bg-dark-500"
            />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Promotion
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}