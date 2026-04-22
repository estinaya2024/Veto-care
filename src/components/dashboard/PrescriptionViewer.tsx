import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';
import logo from '../../assets/images/logo-icon-only.png';

interface PrescriptionViewerProps {
  prescription: any;
  vetName: string;
  petName: string;
  onClose: () => void;
}

export function PrescriptionViewer({ prescription, vetName, petName, onClose }: PrescriptionViewerProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none border border-gray-200">
        
        {/* Modal actions - hidden when printing */}
        <div className="p-4 border-b border-gray-100 flex justify-end gap-3 shrink-0 print:hidden">
           <Button onClick={handlePrint} variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-wider h-9 px-4">
             Imprimer
           </Button>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
             <X size={20} />
           </button>
        </div>
        
        {/* Prescription Paper */}
        <div className="overflow-y-auto p-10 md:p-12 flex-1 print:p-8" id="prescription-paper">
           
           {/* Header */}
           <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
              <div className="flex items-center gap-4">
                 <img src={logo} alt="VetoCare Logo" className="w-16 h-16 object-contain grayscale" />
                 <div>
                    <h1 className="font-heading font-bold text-3xl uppercase tracking-tighter">VetoCare</h1>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Clinique Vétérinaire - Bejaia</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="font-bold text-lg">Dr. {vetName}</p>
                 <p className="font-medium text-[10px] text-gray-500 uppercase tracking-wider">Médecine et Chirurgie Animale</p>
              </div>
           </div>

           {/* Info Block */}
           <div className="flex justify-between items-end mb-12">
              <div>
                 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pour :</p>
                 <p className="font-bold text-2xl">{petName}</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Délivré le :</p>
                 <p className="font-bold text-sm bg-gray-50 px-4 py-1 rounded-lg">
                   {format(new Date(prescription.issued_at || new Date()), 'dd MMMM yyyy', { locale: fr })}
                 </p>
              </div>
           </div>

           {/* Medications */}
           <div className="min-h-[300px]">
             <h2 className="text-3xl font-heading mb-8 text-black opacity-10">Rx</h2>
             <ul className="space-y-6">
               {prescription.medications?.map((med: any, i: number) => (
                 <li key={i} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
                    <span className="font-bold text-lg text-veto-yellow w-6">{i + 1}.</span>
                    <div className="flex-1">
                       <h3 className="font-bold text-lg text-black">{med.name}</h3>
                       <div className="flex items-center gap-3 mt-2">
                          <p className="font-bold text-xs bg-yellow-50 px-3 py-1 rounded-lg text-black">{med.dosage}</p>
                          <p className="font-bold text-xs bg-gray-50 px-3 py-1 rounded-lg text-gray-400">Durée: {med.duration}</p>
                       </div>
                       {med.instructions && (
                         <p className="text-xs font-medium text-gray-500 italic mt-3">
                            • {med.instructions}
                         </p>
                       )}
                    </div>
                 </li>
               ))}
             </ul>
           </div>

           {/* Footer / Signature */}
           <div className="mt-20 flex justify-end">
              <div className="text-center">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-12 border-t border-gray-100 pt-2 w-48 mx-auto">Signature et Cachet</p>
              </div>
           </div>
           
           <div className="mt-12 text-center border-t border-gray-50 pt-4">
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300">
                 Document généré électroniquement par VetoCare - Bejaïa
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
