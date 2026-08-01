const fs = require('fs');
const file = 'src/components/finance/TransactionModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const newMemberContributionsSection = `
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest">Member Contributions</label>
                <button 
                  type="button"
                  onClick={() => setMemberContributions([...memberContributions, { name: '', amount: 0 }])}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + Add Member
                </button>
              </div>
              <div className="space-y-3">
                {memberContributions.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-2">No individual contributions added.</div>
                ) : (
                  memberContributions.map((c, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const newC = [...memberContributions];
                          newC[idx].name = e.target.value;
                          setMemberContributions(newC);
                        }}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Member Name"
                      />
                      <input 
                        type="number"
                        value={c.amount || ''}
                        onChange={(e) => {
                          const newC = [...memberContributions];
                          newC[idx].amount = Number(e.target.value);
                          setMemberContributions(newC);
                        }}
                        className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Amount"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newC = [...memberContributions];
                          newC.splice(idx, 1);
                          setMemberContributions(newC);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
`;

content = content.replace(/\{memberContributions\.length > 0 && \([\s\S]*?\}\)\}/, newMemberContributionsSection.trim());
fs.writeFileSync(file, content);
