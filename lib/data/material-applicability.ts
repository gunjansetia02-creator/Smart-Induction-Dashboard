// Which materials count toward a joiner's induction completion.
//
// - Department-restricted materials (e.g. a Sales-only deck) count only for
//   joiners in that PMS department.
// - Once a joiner has finished every material (joiner_communications.
//   materials_complete_at), materials added AFTER that moment don't count for
//   them — adding new content must never knock a finished joiner back below
//   100%. They can still open those materials; they're shown as optional.

export interface MaterialForApplicability {
  required_department: string | null
  created_at: string
}

export function inDepartment(m: Pick<MaterialForApplicability, 'required_department'>, joinerDept: string | null | undefined): boolean {
  if (!m.required_department) return true
  return (joinerDept ?? '').trim().toLowerCase() === m.required_department.trim().toLowerCase()
}

export function addedAfterCompletion(m: Pick<MaterialForApplicability, 'created_at'>, materialsCompleteAt: string | null | undefined): boolean {
  return Boolean(materialsCompleteAt) && new Date(m.created_at).getTime() > new Date(materialsCompleteAt!).getTime()
}

export function countsForJoiner(m: MaterialForApplicability, joinerDept: string | null | undefined, materialsCompleteAt: string | null | undefined): boolean {
  return inDepartment(m, joinerDept) && !addedAfterCompletion(m, materialsCompleteAt)
}
