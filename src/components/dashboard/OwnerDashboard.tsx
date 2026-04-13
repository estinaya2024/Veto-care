import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { Calendar, Syringe, ChevronRight } from 'lucide-react';

export function OwnerDashboard() {
  const myPets = [
    { name: 'Luna', species: 'Dog', lastVisit: '12 Mar 2026', nextVax: '20 May 2026', status: 'Healthy' },
    { name: 'Oscar', species: 'Cat', lastVisit: '05 Jan 2026', nextVax: '05 Jun 2026', status: 'Ongoing Treatment' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <Heading level={2}>Welcome, Claire!</Heading>
          <p className="text-veto-gray font-medium">Here is the medical overview of your companions.</p>
        </div>
        <Button variant="yellow">+ Add Patient</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {myPets.map((pet) => (
          <div key={pet.name} className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-veto-blue-gray rounded-2xl flex items-center justify-center font-bold text-2xl">
                  {pet.name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">{pet.name}</h3>
                  <p className="text-veto-gray text-sm">{pet.species} • {pet.status}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronRight />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-veto-blue-gray rounded-2xl">
                <Calendar size={20} className="text-veto-gray" />
                <div className="text-sm">
                  <p className="text-veto-gray font-medium">Last Clinical Visit</p>
                  <p className="font-bold">{pet.lastVisit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-veto-light-blue rounded-2xl">
                <Syringe size={20} className="text-veto-gray" />
                <div className="text-sm">
                  <p className="text-veto-gray font-medium">Upcoming Vaccination</p>
                  <p className="font-bold">{pet.nextVax}</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center">View Health Records</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
