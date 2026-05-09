'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useMyAppointments, useAppointments, useCompleteAppointment, useCancelAppointment } from '@/hooks/useAppointments';
import { AppointmentCard } from './AppointmentCard';
import { SlotManager } from './SlotManager';
import { PageHeader } from '@/components/layout/PageHeader';

const tabsStyle: CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid var(--color-border)',
  marginBottom: 'var(--space-4)',
};

const tabButtonStyle = (isActive: boolean): CSSProperties => ({
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

const listContainerStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--space-3)',
};

export function AppointmentDashboard() {
  const [activeTab, setActiveTab] = useState<'my' | 'all' | 'slots'>('my');
  
  const myAppointments = useMyAppointments();
  const allAppointments = useAppointments();
  
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();

  const handleComplete = (id: string) => completeMutation.mutate(id);
  const handleCancel = (id: string) => cancelMutation.mutate({ id });

  const renderContent = () => {
    if (activeTab === 'my') {
      if (myAppointments.isLoading) return <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>;
      const data = myAppointments.data ?? [];
      if (data.length === 0) return <div style={{ color: 'var(--color-text-secondary)' }}>No appointments found.</div>;
      return (
        <div style={listContainerStyle}>
          {data.map(app => (
            <AppointmentCard 
              key={app.id} 
              appointment={app} 
              onComplete={handleComplete} 
              onCancel={handleCancel} 
            />
          ))}
        </div>
      );
    }
    
    if (activeTab === 'all') {
      if (allAppointments.isLoading) return <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>;
      const data = allAppointments.data ?? [];
      if (data.length === 0) return <div style={{ color: 'var(--color-text-secondary)' }}>No appointments found.</div>;
      return (
        <div style={listContainerStyle}>
          {data.map(app => (
            <AppointmentCard 
              key={app.id} 
              appointment={app} 
              onComplete={handleComplete} 
              onCancel={handleCancel} 
            />
          ))}
        </div>
      );
    }
    
    if (activeTab === 'slots') {
      return <SlotManager />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PageHeader 
        title="Appointments" 
        subtitle="Manage your schedule and student meetings." 
      />
      
      <div style={tabsStyle}>
        <button style={tabButtonStyle(activeTab === 'my')} onClick={() => setActiveTab('my')}>
          My Appointments
        </button>
        <button style={tabButtonStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>
          All Appointments
        </button>
        <button style={tabButtonStyle(activeTab === 'slots')} onClick={() => setActiveTab('slots')}>
          Manage Slots
        </button>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
}
