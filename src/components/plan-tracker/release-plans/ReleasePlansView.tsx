import { useState, useEffect } from 'react';
import { Plus, Layers } from 'lucide-react';
import { DetailedPlanningGuidelines } from '../guidelines';
import { ReleasePlanGroup } from './ReleasePlanGroup';
import AddReleaseModal from '../../AddReleaseModal';
import AddEpicModal from '../../AddEpicModal';
import DeleteConfirmationModal from '../../DeleteConfirmationModal';

interface Epic {
  Name?: string;
  description?: string;
  loe?: string;
  figma?: string;
  Link?: string;
  Status?: string;
}

interface ReleasePlan {
  id: string;
  goal: string;
  status: string;
  loe: string;
  devs: string;
  devPlan: string;
  reqDoc: string;
  planningStartDate: string;
  planningEndDate: string;
  devStartDate: string;
  devEndDate: string;
  internalReleaseDate: string;
  externalReleaseDate: string;
  Epics?: Epic[];
}

interface ReleasePlansViewProps {
  data: {
    Initiative?: {
      ReleasePlan?: ReleasePlan[];
    };
  };
  updateReleasePlan: (planIndex: number, field: string, value: string) => void;
  addReleasePlan: (name: string) => Promise<void>;
  deleteReleasePlan: (planIndex: number) => void;
  updateEpic: (planIndex: number, epicIndex: number, field: string, value: string) => void;
  addEpic: (planIndex: number, name: string) => Promise<void>;
  deleteEpic: (planIndex: number, epicIndex: number) => void;
}

interface DeleteModalState {
  isOpen: boolean;
  type: 'release' | 'epic' | null;
  planIndex: number | null;
  epicIndex?: number | null;
  itemName: string;
}

export function ReleasePlansView({
  data,
  updateReleasePlan,
  addReleasePlan,
  deleteReleasePlan,
  updateEpic,
  addEpic,
  deleteEpic,
}: ReleasePlansViewProps) {
  const releasePlans = data.Initiative?.ReleasePlan || [];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [activePlanIndex, setActivePlanIndex] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: null,
    planIndex: null,
    epicIndex: null,
    itemName: '',
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, [releasePlans]);

  const handleAddEpicClick = (planIndex: number) => {
    setActivePlanIndex(planIndex);
    setIsEpicModalOpen(true);
  };

  const handleEpicSubmit = async (name: string) => {
    if (activePlanIndex !== null) {
      await addEpic(activePlanIndex, name);
    }
  };

  const handleDeleteReleaseRequest = (idx: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'release',
      planIndex: idx,
      itemName: name,
    });
  };

  const handleDeleteEpicRequest = (pIdx: number, eIdx: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'epic',
      planIndex: pIdx,
      epicIndex: eIdx,
      itemName: name,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'release' && deleteModal.planIndex !== null) {
      deleteReleasePlan(deleteModal.planIndex);
    } else if (deleteModal.type === 'epic' && deleteModal.planIndex !== null && deleteModal.epicIndex !== null && deleteModal.epicIndex !== undefined) {
      deleteEpic(deleteModal.planIndex, deleteModal.epicIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Release Plans Breakdown</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Release
        </button>
      </div>

      <DetailedPlanningGuidelines />

      {releasePlans.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Releases Defined</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Define your release groups and break them down into technical epics.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Release
          </button>
        </div>
      ) : (
        releasePlans.map((plan, idx) => (
          <ReleasePlanGroup
            key={plan.id || idx}
            plan={plan}
            planIndex={idx}
            updateReleasePlan={updateReleasePlan}
            onDeleteReleasePlan={(i) => handleDeleteReleaseRequest(i, plan.goal)}
            updateEpic={updateEpic}
            onDeleteEpic={(pi, ei) => handleDeleteEpicRequest(pi, ei, plan.Epics?.[ei]?.Name || '')}
            onAddEpic={handleAddEpicClick}
          />
        ))
      )}

      <AddReleaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addReleasePlan}
      />

      <AddEpicModal
        isOpen={isEpicModalOpen}
        onClose={() => setIsEpicModalOpen(false)}
        onSubmit={handleEpicSubmit}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.type === 'release' ? 'Delete Release Plan' : 'Delete Epic'}
        message={
          deleteModal.type === 'release'
            ? 'Are you sure you want to delete this release plan? All associated epics and tracking data will be permanently removed.'
            : 'Are you sure you want to delete this epic?'
        }
        itemName={deleteModal.itemName}
      />
    </div>
  );
}
