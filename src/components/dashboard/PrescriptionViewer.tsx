import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-scaleIn relative flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal actions - hidden when printing */}
        <div className="p-6 border-b border-black/5 flex justify-end gap-3 shrink-0 print:hidden">
           <Button onClick={handlePrint} variant="outline" size="sm" className="font-extrabold uppercase text-[10px] tracking-widest">
             Imprimer
           </Button>
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-veto-yellow hover:text-black rounded-full transition-colors font-black shadow-sm border border-black/5">X</button>
        </div>
        
        {/* Prescription Paper */}
        <div className="overflow-y-auto p-12 flex-1 print:p-8" id="prescription-paper">
           
           {/* Header */}
           <div className="flex justify-between items-start border-b-2 border-veto-black pb-8 mb-8">
              <div className="flex items-center gap-4">
                 <img src={logo} alt="VetoCare Logo" className="w-16 h-16 object-contain grayscale" />
                 <div>
                    <h1 className="font-heading font-black text-3xl uppercase tracking-tighter">VetoMedical</h1>
                    <p className="font-bold text-[11px] uppercase tracking-widest text-veto-gray">Clinique Vétérinaire - Bejaia</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="font-black text-lg">Dr. {vetName}</p>
                 <p className="font-medium text-xs text-veto-gray">Médecine et Chirurgie des Animaux</p>
                 <p className="font-bold text-[10px] mt-2">N° Ordre: 124578</p>
              </div>
           </div>

           {/* Info Block */}
           <div className="flex justify-between items-end mb-12">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-veto-gray mb-1">Pour :</p>
                 <p className="font-black text-2xl">{petName}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-veto-gray mb-1">Date de prescription :</p>
                 <p className="font-bold text-sm bg-gray-100 px-4 py-1 rounded-full">
                   {format(new Date(prescription.issued_at || new Date()), 'dd MMMM yyyy', { locale: fr })}
                 </p>
              </div>
           </div>

           {/* Medications */}
           <div className="min-h-[300px]">
             <h2 className="text-4xl font-heading mb-10 text-veto-gray italic opacity-50">Rx</h2>
             <ul className="space-y-8">
               {prescription.medications?.map((med: any, i: number) => (
                 <li key={i} className="flex gap-4 border-b border-black/5 pb-6">
                    <span className="font-black text-xl text-veto-yellow w-6">{i + 1}.</span>
                    <div className="flex-1">
                       <h3 className="font-black text-lg text-veto-black">{med.name}</h3>
                       <div className="flex items-center gap-4 mt-2">
                          <p className="font-bold text-sm bg-yellow-50 px-3 py-1 rounded-lg text-veto-black">{med.dosage}</p>
                          <p className="font-bold text-sm bg-gray-50 px-3 py-1 rounded-lg text-veto-gray">Pdt: {med.duration}</p>
                       </div>
                       {med.instructions && (
                         <p className="text-xs font-medium text-veto-gray italic mt-3 flex items-center gap-2">
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
                 <p className="text-[10px] font-black uppercase tracking-widest text-veto-gray mb-12 border-t border-black/20 pt-2 w-48 mx-auto">Signature et Cachet</p>
              </div>
           </div>
           
           <div className="mt-12 text-center border-t border-black/5 pt-4">
              <p className="text-[8px] font-black uppercase tracking-widest text-veto-gray opacity-40">
                 Document généré électroniquement par VetoCare - Rue de la Liberté, Béjaïa 06000
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
