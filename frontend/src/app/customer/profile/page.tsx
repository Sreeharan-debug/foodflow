'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { MapPin, Plus, Trash2, Home, Briefcase, Mail, User, ShieldAlert, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Address {
  id: string;
  label: string;
  houseNumber: string;
  buildingName?: string;
  area: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [houseNumber, setHouseNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch addresses
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/users/addresses');
      return res.data;
    },
  });

  // 2. Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: async (newAddress: Omit<Address, 'id'>) => {
      const res = await api.post('/users/addresses', newAddress);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddressForm(false);
      setHouseNumber('');
      setBuildingName('');
      setArea('');
      setLandmark('');
      setCity('');
      setDistrict('');
      setState('');
      setPincode('');
      setAddressLabel('Home');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to add address');
    },
  });

  // 3. Remove Address Mutation
  const removeAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!houseNumber || !area || !city || !district || !state || !pincode) {
      setFormError('Please fill out all required address fields');
      return;
    }
    addAddressMutation.mutate({
      label: addressLabel,
      houseNumber,
      buildingName: buildingName || undefined,
      area,
      landmark: landmark || undefined,
      city,
      district,
      state,
      pincode,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-3xl font-extrabold font-outfit text-foreground">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* User Account Info Sidebar */}
          <div className="glass p-6 rounded-2xl border border-border/40 space-y-6">
            <div className="flex flex-col items-center pb-4 border-b border-border/20 gap-3">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-violet-500/20 shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20 shrink-0">
                  <User className="w-10 h-10" />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-sm font-bold font-outfit text-foreground">{user?.name}</h2>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</span>
                  <p className="text-sm font-bold text-foreground">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</span>
                  <p className="text-sm font-semibold text-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Role & Status</span>
                  <div className="flex gap-2 mt-0.5">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {user?.role}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-green-500/20 text-green-300 border border-green-500/30">
                      {user?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Book main frame */}
          <div className="md:col-span-2 glass p-6 rounded-2xl border border-border/40 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-400" />
                Address Book
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Expandable address form */}
            {showAddressForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleAddAddress}
                className="p-5 rounded-xl bg-secondary/20 border border-border/40 space-y-4"
              >
                <h3 className="text-xs font-bold text-foreground">New Delivery Location</h3>
                {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}

                 <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Label</label>
                    <select
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">House / Flat No. *</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 4B, 2nd Floor"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Building Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rose Apartments"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Area / Locality / Street *</label>
                    <input
                      type="text"
                      placeholder="e.g. MG Road"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Central Library"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">City *</label>
                    <input
                      type="text"
                      placeholder="Kozhikode"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">District *</label>
                    <input
                      type="text"
                      placeholder="Kozhikode"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">State *</label>
                    <input
                      type="text"
                      placeholder="Kerala"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Pincode *</label>
                    <input
                      type="text"
                      placeholder="673001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3 py-1.5 border border-border/40 rounded-lg text-xs font-semibold hover:bg-secondary/40 text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-xs font-bold text-white shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* addresses list */}
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-8 border border-dashed border-border/40 rounded-2xl text-center text-sm text-muted-foreground">
                No delivery addresses added yet. Add a location to expedite checking out.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const Icon = addr.label === 'Home' ? Home : Briefcase;
                  return (
                    <div
                      key={addr.id}
                      className="p-4 rounded-xl border bg-secondary/10 border-border/40 hover:bg-secondary/20 transition-all flex items-start gap-3 relative group"
                    >
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1 pr-6">
                        <h4 className="text-xs font-bold text-foreground uppercase">{addr.label}</h4>
                        <p className="text-xs text-muted-foreground leading-normal">
                          {addr.houseNumber}
                          {addr.buildingName ? `, ${addr.buildingName}` : ''}
                          {`, ${addr.area}`}
                          {addr.landmark ? ` (Landmark: ${addr.landmark})` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                        </p>
                      </div>

                      {/* delete address trigger */}
                      <button
                        onClick={() => removeAddressMutation.mutate(addr.id)}
                        disabled={removeAddressMutation.isPending}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
