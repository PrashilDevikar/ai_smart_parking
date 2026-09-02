'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, CheckCircle2, AlertCircle, Cpu, Clock, Layers } from 'lucide-react';

export default function OperatorSettingsContent() {
  const [settings, setSettings] = useState({
    parkingName: 'AI Smart Parking Grand Terminal',
    pricePerHour: 5.0,
    floorsCount: 3,
    openingHour: '06:00',
    closingHour: '23:59',
    aiConfidenceThreshold: 0.30,
    autoReleaseMinutes: 15,
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/operator/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/operator/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: 'System configuration parameters saved successfully.' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network error saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          System & Facility Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure default parking rates, operating hours, and AI computer vision parameters.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Facility Information & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Input
              label="Parking Facility Name"
              value={settings.parkingName}
              onChange={(e) => setSettings({ ...settings, parkingName: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={settings.pricePerHour}
                  onChange={(e) => setSettings({ ...settings, pricePerHour: parseFloat(e.target.value) || 5.0 })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Active Floors</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.floorsCount}
                  onChange={(e) => setSettings({ ...settings, floorsCount: parseInt(e.target.value) || 3 })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Operating Hours & Reservation Buffer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={settings.openingHour}
                  onChange={(e) => setSettings({ ...settings, openingHour: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={settings.closingHour}
                  onChange={(e) => setSettings({ ...settings, closingHour: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auto-Release Unoccupied Reserved Slots (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.autoReleaseMinutes}
                onChange={(e) => setSettings({ ...settings, autoReleaseMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              AI YOLO Computer Vision Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Vehicle Detection Confidence Threshold</span>
                <span className="text-blue-600 font-mono">{Math.round(settings.aiConfidenceThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={settings.aiConfidenceThreshold}
                onChange={(e) => setSettings({ ...settings, aiConfidenceThreshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
          Save All System Settings
        </Button>
      </form>
    </div>
  );
}
