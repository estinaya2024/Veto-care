import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Search, User, Plus } from 'lucide-react';

export function VetDashboard() {
  const patients = [
    { id: 1, name: 'Luna', owner: 'Claire Martin', breed: 'Labrador', lastVisit: '12/03/2026' },
    { id: 2, name: 'Oscar', owner: 'Marc Dupont', breed: 'Siamois', lastVisit: '05/01/2026' },
    { id: 3, name: 'Bella', owner: 'Sophie Bernard', breed: 'Golden Retriever', lastVisit: '20/03/2026' },
    { id: 4, name: 'Max', owner: 'Jean Petit', breed: 'Beagle', lastVisit: '15/02/2026' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Heading level={2}>Gestion Patients</Heading>
        <Button variant="black"><Plus size={20} /> Nouvelle Consultation</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-veto-gray" size={20} />
        <input
          type="text"
          placeholder="Rechercher un animal ou un propriétaire..."
          className="w-full pl-16 pr-6 py-5 bg-white rounded-full border-none shadow-sm focus:ring-2 focus:ring-veto-black transition-all"
        />
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm">
        <div className="grid grid-cols-4 p-8 border-b border-veto-blue-gray font-bold text-sm text-veto-gray">
          <span>ANIMAL</span>
          <span>PROPRIÉTAIRE</span>
          <span>RACE</span>
          <span>DERNIÈRE VISITE</span>
        </div>
        <div className="divide-y divide-veto-blue-gray">
          {patients.map((p) => (
            <div key={p.id} className="grid grid-cols-4 p-8 items-center hover:bg-veto-blue-gray/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-veto-light-blue rounded-full flex items-center justify-center">
                  <User size={18} className="text-veto-black" />
                </div>
                <span className="font-bold">{p.name}</span>
              </div>
              <span className="text-veto-gray">{p.owner}</span>
              <span className="text-veto-gray">{p.breed}</span>
              <span className="font-medium">{p.lastVisit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
