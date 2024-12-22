import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Percent, Tag, Trash2, Edit2 } from 'lucide-react';
import { usePromos } from '../../hooks/usePromos';
import { PromoForm } from '../../components/admin/PromoForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Promo } from '../../types/promo';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function PromoManager() {
  const { promos, loading, error, createPromo, updatePromo, deletePromo } = usePromos();
  const [showForm, setShowForm] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  const handleCreatePromo = async (data: Partial<Promo>) => {
    await createPromo(data as Omit<Promo, 'id'>);
    setShowForm(false);
  };

  const handleUpdatePromo = async (data: Partial<Promo>) => {
    if (selectedPromo?.id) {
      await updatePromo(selectedPromo.id, data);
      setSelectedPromo(null);
      setShowForm(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      await deletePromo(id);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading promotions: {error.message}</div>;

  const activePromos = promos.filter(promo => promo.isActive);
  const inactivePromos = promos.filter(promo => !promo.isActive);

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Promotion Manager</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" /> Create Promotion
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 
          bg-gradient-to-br from-teal-800 to-teal-900 
          border border-teal-700 
          rounded-xl 
          text-center 
          space-y-6 
          relative 
          overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-700/10 to-transparent opacity-30"></div>
          
          <div className="bg-teal-700/50 p-4 rounded-full border border-teal-600/50 relative z-10">
            <Tag className="h-12 w-12 text-teal-200" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-teal-100 mb-4">
              No Active Promotions
            </h2>
            <p className="text-teal-300 max-w-md mx-auto mb-6">
              Create your first promotion to start offering deals to your customers!
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              variant="default"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300"
            >
              Create First Promotion
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {activePromos.map((promo) => (
            <Card key={promo.id} className="bg-dark-600/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  {promo.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPromo(promo);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => promo.id && handleDeletePromo(promo.id)}
                    className="p-2 hover:bg-dark-500 rounded-lg transition-colors text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Percent className="h-4 w-4 text-teal-400" />
                    <span>{promo.discount}% Off</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-teal-400" />
                    <span>
                      {new Date(promo.startDate).toLocaleDateString()} - 
                      {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-teal-400" />
                    <span>{promo.type}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {inactivePromos.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-4">Inactive Promotions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-60">
            {inactivePromos.map((promo) => (
              <Card key={promo.id} className="bg-dark-600/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {promo.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPromo(promo);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => promo.id && handleDeletePromo(promo.id)}
                      className="p-2 hover:bg-dark-500 rounded-lg transition-colors text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Percent className="h-4 w-4 text-teal-400" />
                      <span>{promo.discount}% Off</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-teal-400" />
                      <span>
                        {new Date(promo.startDate).toLocaleDateString()} - 
                        {new Date(promo.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-teal-400" />
                      <span>{promo.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {showForm && (
          <PromoForm
            onSubmit={selectedPromo ? handleUpdatePromo : handleCreatePromo}
            onClose={() => {
              setShowForm(false);
              setSelectedPromo(null);
            }}
            initialData={selectedPromo || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}