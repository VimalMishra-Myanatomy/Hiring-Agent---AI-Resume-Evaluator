import SectionCard from '../ui/SectionCard'

export default function BonusDeductionsPanel({ bonus, deductions }) {
  return (
    <SectionCard title="Bonus & Deductions" subtitle="Adjustments applied to base score">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-hr-green/5 border border-hr-green/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-hr-green">Bonus Points</span>
            <span className="text-xl font-bold text-hr-green">+{bonus?.total ?? 0}</span>
          </div>
          <p className="text-sm text-hr-muted leading-relaxed">
            {bonus?.breakdown || 'No bonus points awarded.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-hr-danger/5 border border-hr-danger/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-hr-danger">Deductions</span>
            <span className="text-xl font-bold text-hr-danger">
              −{deductions?.total ?? 0}
            </span>
          </div>
          <p className="text-sm text-hr-muted leading-relaxed">
            {deductions?.reasons || 'No deductions applied.'}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
