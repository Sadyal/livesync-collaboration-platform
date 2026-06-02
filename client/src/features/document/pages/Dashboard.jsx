import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useDocuments } from '../hooks';
import DocList from '../components/DocList';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import '../components/DocumentUI.css';

const Dashboard = () => {
  // ==========================================
  // STATE MANAGEMENT & HOOKS
  // ==========================================
  const navigate = useNavigate();
  const { docs, isLoading, createDoc, error } = useDocuments();
  const { isOnline } = useNetworkStatus();
  const [isCreating, setIsCreating] = useState(false);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  /**
   * Handles the creation of a new document.
   * Demonstrates offline-first / mock capability by navigating
   * even if the backend save fails (handled in useDocuments hook).
   */
  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const newDoc = await createDoc({ 
        title: 'Untitled Document', 
        content: '' 
      });
      // Navigate straight to the newly created document
      navigate(`/docs/${newDoc.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
      alert('Could not create document. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // ==========================================
  // RENDER LOGIC
  // ==========================================
  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Your Documents</h1>
          <p className="dashboard-subtitle">Manage, edit, and share your workspace.</p>
        </div>
        <Button 
          onClick={handleCreateNew} 
          isLoading={isCreating}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} />
          <span>New Document</span>
        </Button>
      </div>

      {/* Network / API Warnings */}
      {error && isOnline && (
        <div className="error-banner">
          Backend is unavailable. Showing mock data for UI testing.
        </div>
      )}

      {/* Document Grid/List */}
      <div className="dashboard-content">
        <DocList docs={docs} />
      </div>
    </div>
  );
};

export default Dashboard;
