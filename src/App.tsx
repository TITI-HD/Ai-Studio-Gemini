import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Home, FileText, CheckCircle, Clock, XCircle, LayoutDashboard, PlusCircle, User, LogOut, Download, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

// Store layout & role switch for demo
const MainLayout = ({ children, role, setRole }: { children: React.ReactNode, role: string, setRole: (r: string) => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">EC</div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">État Civil</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors">Tableau de bord</Link>
              {role === 'citoyen' && (
                <Link to="/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-bold">Nouvelle Demande</Link>
              )}
              
              <div className="border-l border-slate-200 pl-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <User size={16} />
                </div>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent border-none text-slate-700 font-bold focus:ring-0 cursor-pointer"
                >
                  <option value="citoyen">Citoyen (Jean Dupont)</option>
                  <option value="agent">Agent (Mairie)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'ATTENTE') return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">À traiter</span>;
  if (status === 'VALIDE') return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">Validé</span>;
  if (status === 'REJETE') return <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">Rejeté</span>;
  return <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">{status}</span>;
}

const TypeActeBadge = ({ type }: { type: string }) => {
  const map: Record<string, string> = { NAISSANCE: "Acte de Naissance", MARIAGE: "Acte de Mariage", DECES: "Acte de Décès" };
  return <span className="font-bold text-slate-800">{map[type] || type}</span>;
}

const CitizenDashboard = () => {
  const [dossiers, setDossiers] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/dossiers?role=citoyen').then(r => r.json()).then(data => setDossiers(data.dossiers));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mes Demandes</h1>
          <p className="text-slate-500 font-medium mt-1">Suivez l'état d'avancement de vos demandes d'actes en temps réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dossiers.map(dossier => (
          <div key={dossier.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">#DOS-{dossier.id}</span>
                  <StatusBadge status={dossier.statut} />
               </div>
               <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  <TypeActeBadge type={dossier.type_acte} />
               </h3>
               <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-slate-300" />
                  {new Date(dossier.date_soumission).toLocaleDateString()}
               </div>
               {dossier.priorite === 1 && (
                 <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-xl w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    Priorité Haute
                 </div>
               )}
            </div>
            <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-t border-slate-100/50">
               <Link to={`/dossier/${dossier.id}`} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-800 flex items-center gap-1 group/link">
                 Voir détails
                 <LayoutDashboard className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
               </Link>
            </div>
          </div>
        ))}
        {dossiers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold text-lg mb-2">Aucun dossier en cours</p>
             <p className="text-slate-400 text-sm mb-6">Vous n'avez pas encore soumis de demande d'acte.</p>
             <Link to="/nouveau" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                Faire ma première demande
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const AgentDashboard = () => {
  const [dossiers, setDossiers] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<string>('ALL');

  React.useEffect(() => {
    fetch(`/api/dossiers?role=agent&statut=${filter}`).then(r => r.json()).then(data => setDossiers(data.dossiers));
  }, [filter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 shrink-0 gap-6">
        <div>
           <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tableau de bord Agent</h2>
           <p className="text-slate-500 font-medium">Gestion des demandes et génération d'extraits en temps réel.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[160px]">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
                 {dossiers.length}
              </div>
              <div>
                 <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Total</p>
                 <p className="text-sm font-bold text-slate-800">Dossiers</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 shrink-0 gap-4">
         <div className="flex flex-wrap gap-2">
            {['ALL', 'ATTENTE', 'VALIDE', 'REJETE'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                {f === 'ALL' ? 'Tous' : f === 'ATTENTE' ? 'À traiter' : f === 'VALIDE' ? 'Validés' : 'Rejetés'}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col mb-4">
         <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
               <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Dossier ID</th>
                     <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Citoyen</th>
                     <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Type d'acte</th>
                     <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                     <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                     <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {dossiers.map(dossier => (
                    <tr key={dossier.id} className={`hover:bg-slate-50 transition-colors ${dossier.priorite === 1 ? 'bg-amber-50/40' : ''}`}>
                       <td className="px-6 py-5 text-sm font-mono font-bold text-slate-500">#DOS-{dossier.id}</td>
                       <td className="px-6 py-5">
                          <div className="text-sm font-extrabold text-slate-900">{dossier.first_name} {dossier.last_name}</div>
                          <div className="text-xs text-slate-400 font-medium">{dossier.email}</div>
                       </td>
                       <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                          <TypeActeBadge type={dossier.type_acte} />
                       </td>
                       <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                          {new Date(dossier.date_soumission).toLocaleDateString()}
                       </td>
                       <td className="px-6 py-5">
                          <StatusBadge status={dossier.statut} />
                          {dossier.priorite === 1 && <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase inline-block">URGENT</span>}
                       </td>
                       <td className="px-6 py-5 text-right">
                          <Link to={`/dossier/${dossier.id}`} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all">Examiner</Link>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}

const DossierDetail = ({ role }: { role: string }) => {
  const { id } = useParams();
  const [dossier, setDossier] = React.useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch(`/api/dossiers/${id}`).then(r => r.json()).then(data => {
      setDossier(data);
    });
  }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/dossiers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setDossier({...dossier, statut: status});
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("EXTRAIT D'ETAT CIVIL", 20, 20);
    doc.setFontSize(12);
    doc.text(`Identifiant: #DOS-${dossier.id}`, 20, 40);
    doc.text(`Acte: ${dossier.type_acte}`, 20, 50);
    doc.text(`Concernant: ${dossier.prenom_concerne} ${dossier.nom_concerne}`, 20, 60);
    doc.text(`Date de l'événement: ${dossier.date_evenement}`, 20, 70);
    doc.text(`Statut actuel: ${dossier.statut}`, 20, 90);
    doc.save(`Extrait_DOS_${dossier.id}.pdf`);
  }

  if (!dossier) return <div>Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 flex-1">
      <nav className="flex text-xs font-black uppercase tracking-[0.2em] text-slate-400 gap-2 items-center">
         <Link to="/" className="hover:text-blue-600">Tableau de Bord</Link>
         <span>/</span>
         <span className="text-slate-900">Dossier #{dossier.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                   <div>
                      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Dossier #{dossier.id}</h2>
                      <p className="text-lg font-bold text-blue-600"><TypeActeBadge type={dossier.type_acte} /></p>
                   </div>
                   <StatusBadge status={dossier.statut} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 border-y border-slate-100 py-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Demandeur</p>
                      <p className="text-sm font-extrabold text-slate-900">{dossier.first_name} {dossier.last_name}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sujet de l'acte</p>
                      <p className="text-sm font-extrabold text-slate-900">{dossier.prenom_concerne} {dossier.nom_concerne}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date de l'événement</p>
                      <p className="text-sm font-extrabold text-slate-900">{dossier.date_evenement}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priorité</p>
                      <p className={`text-sm font-extrabold ${dossier.priorite === 1 ? 'text-rose-600' : 'text-slate-900'}`}>
                         {dossier.priorite === 1 ? 'URGENT' : 'NORMALE'}
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {role === 'agent' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col gap-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">Actions Agent</h3>
               <div className="flex flex-wrap gap-4">
                 {dossier.statut !== 'VALIDE' && (
                   <button onClick={() => updateStatus('VALIDE')} className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-emerald-700 transition">Valider & Approuver</button>
                 )}
                 {dossier.statut !== 'REJETE' && (
                   <button onClick={() => updateStatus('REJETE')} className="flex-1 bg-rose-600 text-white px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-rose-700 transition">Rejeter</button>
                 )}
               </div>
               {dossier.statut === 'VALIDE' && (
                 <button onClick={generatePDF} className="w-full mt-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black tracking-[0.1em] uppercase shadow-lg shadow-slate-900/20 text-center hover:scale-[1.02] active:scale-95 transition-all">
                    Générer PDF de l'Extrait
                 </button>
               )}
            </div>
          )}

          {role === 'citoyen' && dossier.statut === 'VALIDE' && (
            <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-emerald-900 font-extrabold text-lg">Votre document est prêt</h3>
                <p className="text-emerald-700 text-sm font-medium mt-1">L'agent a validé votre demande.</p>
              </div>
              <button onClick={generatePDF} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-emerald-700 transition">
                <Download size={16} /> Télécharger
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6">Info Système</h4>
              <div className="space-y-6">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifiant Unique</span>
                    <span className="text-sm font-mono font-extrabold text-blue-600">DOS-{dossier.id}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const DossierForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    type_acte: 'NAISSANCE',
    nom_concerne: '',
    prenom_concerne: '',
    date_evenement: '',
    priorite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    navigate('/');
  }

  return (
    <div className="max-w-2xl mx-auto py-12 w-full">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
         <div className="bg-blue-600 px-10 py-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Nouvelle Demande</h1>
            <p className="text-blue-100 font-medium mt-2">Soumettez vos informations pour obtenir un acte d'état civil officiel.</p>
         </div>
         <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Type d'acte demandé</label>
                  <select 
                    value={formData.type_acte}
                    onChange={(e) => setFormData({...formData, type_acte: e.target.value})}
                    className="w-full rounded-2xl border-slate-200 shadow-sm px-4 py-3 bg-slate-50 focus:ring-blue-600 focus:border-blue-600 font-medium"
                    required
                  >
                    <option value="NAISSANCE">Acte de Naissance</option>
                    <option value="MARIAGE">Acte de Mariage</option>
                    <option value="DECES">Acte de Décès</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Prénom attendu sur l'acte</label>
                    <input type="text" required value={formData.prenom_concerne} onChange={e => setFormData({...formData, prenom_concerne: e.target.value})} className="w-full rounded-2xl border-slate-200 shadow-sm px-4 py-3 bg-slate-50 font-medium" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Nom de famille</label>
                    <input type="text" required value={formData.nom_concerne} onChange={e => setFormData({...formData, nom_concerne: e.target.value})} className="w-full rounded-2xl border-slate-200 shadow-sm px-4 py-3 bg-slate-50 font-medium" />
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Date de l'événement</label>
                  <input type="date" required value={formData.date_evenement} onChange={e => setFormData({...formData, date_evenement: e.target.value})} className="w-full rounded-2xl border-slate-200 shadow-sm px-4 py-3 bg-slate-50 font-medium" />
               </div>
               <div className="flex items-center gap-3">
                  <input type="checkbox" id="priorite" checked={formData.priorite} onChange={e => setFormData({...formData, priorite: e.target.checked})} className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-600" />
                  <label htmlFor="priorite" className="text-sm font-bold text-slate-900">Demande prioritaire ou urgente</label>
               </div>
            </div>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button type="submit" className="flex-grow bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20 active:scale-95">
                    Envoyer le Dossier
                </button>
                <Link to="/" className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all text-center">
                    Annuler
                </Link>
            </div>
         </form>
      </div>
    </div>
  )
}

function App() {
  const [role, setRole] = useState('citoyen');

  return (
    <BrowserRouter>
      <MainLayout role={role} setRole={setRole}>
        <Routes>
          <Route path="/" element={role === 'agent' ? <AgentDashboard /> : <CitizenDashboard />} />
          <Route path="/dossier/:id" element={<DossierDetail role={role} />} />
          <Route path="/nouveau" element={role === 'citoyen' ? <DossierForm /> : <Navigate to="/" />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
