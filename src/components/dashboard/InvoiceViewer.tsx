import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Printer, Download } from 'lucide-react';
import logo from '../../assets/images/logo-icon-only.png';

interface InvoiceViewerProps {
  consultation: any;
  petName: string;
  onClose: () => void;
}

export function InvoiceViewer({ consultation, petName, onClose }: InvoiceViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none border border-gray-100 overflow-hidden">
        
        {/* Modal actions - hidden when printing */}
        <div className="p-4 border-b border-gray-50 flex justify-end gap-3 shrink-0 print:hidden bg-gray-50/50">
           <Button onClick={handlePrint} variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-wider h-9 px-4 rounded-xl">
             <Printer size={14} className="mr-2" /> Imprimer
           </Button>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
             <X size={20} />
           </button>
        </div>
        
        <div className="overflow-y-auto p-12 print:p-8" id="invoice-content">
           <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-4">
                 <img src={logo} alt="VetoCare" className="w-16 h-16 object-contain" />
                 <div>
                    <h1 className="font-black text-3xl uppercase tracking-tighter">VetoCare</h1>
                    <p className="font-bold text-[10px] uppercase tracking-widest text-gray-400">Facture Clinique - Bejaia</p>
                 </div>
              </div>
              <div className="text-right">
                 <h2 className="text-xl font-black text-gray-900 uppercase">Facture</h2>
                 <p className="text-xs text-gray-500 font-bold">#{consultation.id?.slice(0, 8).toUpperCase()}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-100">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Détails Client</p>
                 <p className="font-bold text-gray-900 text-lg">{petName}</p>
                 <p className="text-sm text-gray-500">Patient VetoCare</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Détails Clinique</p>
                 <p className="font-bold text-gray-900">Dr. {consultation.veterinaires?.name}</p>
                 <p className="text-sm text-gray-500">Médecine Vétérinaire</p>
                 <p className="text-xs text-gray-400 mt-1">{format(new Date(consultation.date_consultation), 'dd MMMM yyyy', { locale: fr })}</p>
              </div>
           </div>

           <table className="w-full mb-12">
              <thead>
                 <tr className="border-b-2 border-gray-900">
                    <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest">Description des Soins</th>
                    <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Montant</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 <tr>
                    <td className="py-6">
                       <p className="font-bold text-gray-900">Consultation Médicale</p>
                       <p className="text-xs text-gray-500 mt-1">{consultation.diagnosis || 'Examen de routine'}</p>
                    </td>
                    <td className="py-6 text-right font-bold text-gray-900">{consultation.price} DA</td>
                 </tr>
                 {consultation.treatment && (
                    <tr>
                       <td className="py-6">
                          <p className="font-bold text-gray-900">Traitement & Actes</p>
                          <p className="text-xs text-gray-500 mt-1">{consultation.treatment}</p>
                       </td>
                       <td className="py-6 text-right font-bold text-gray-600">Inclus</td>
                    </tr>
                 )}
              </tbody>
           </table>

           <div className="bg-gray-900 text-white p-8 rounded-3xl flex justify-between items-center">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total à régler</p>
                 <p className="text-xs text-gray-400 italic">Net de taxe (TVA non applicable)</p>
              </div>
              <p className="text-4xl font-black">{consultation.price} DA</p>
           </div>

           <div className="mt-16 text-center">
              <div className="inline-block p-6 bg-gray-50 rounded-2xl border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status du paiement</p>
                 <p className={`font-black uppercase tracking-widest ${consultation.is_paid ? 'text-green-600' : 'text-orange-600'}`}>
                    {consultation.is_paid ? 'Payée' : 'En attente de paiement'}
                 </p>
              </div>
           </div>

           <div className="mt-20 pt-8 border-t border-gray-50 text-center">
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                 Merci de votre confiance • VetoCare Bejaïa • Simple & Moderne
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
