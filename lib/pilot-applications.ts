import type {
  EstimatedVolumeRange,
  InstitutionPilotApplicationInput,
  InstitutionType,
  InstitutionUseCase,
  PilotApplicationInput,
} from '@/lib/types'

export const INSTITUTION_TYPE_OPTIONS: Array<{ value: InstitutionType; label: string }> = [
  { value: 'lender', label: 'Lender / CDFI' },
  { value: 'health_system', label: 'Health system / hospital' },
  { value: 'grocery_partner', label: 'Grocery / food buyer' },
  { value: 'public_agency', label: 'Public agency' },
  { value: 'nonprofit', label: 'Nonprofit / foundation' },
]

export const INSTITUTION_USE_CASE_OPTIONS: Array<{ value: InstitutionUseCase; label: string }> = [
  { value: 'underwriting', label: 'Financing and underwriting' },
  { value: 'procurement', label: 'Procurement and supplier discovery' },
  { value: 'nutrition_program', label: 'Nutrition or food access programming' },
  { value: 'community_health', label: 'Community health planning' },
  { value: 'impact_reporting', label: 'Impact or compliance reporting' },
]

export const ESTIMATED_VOLUME_OPTIONS: Array<{ value: EstimatedVolumeRange; label: string }> = [
  { value: 'under_250k', label: 'Under $250k / year' },
  { value: '250k_to_1m', label: '$250k to $1M / year' },
  { value: '1m_to_5m', label: '$1M to $5M / year' },
  { value: 'over_5m', label: 'Over $5M / year' },
]

function readString(
  input: Record<string, unknown>,
  key: string,
): string {
  return typeof input[key] === 'string' ? input[key].trim() : ''
}

export function institutionTypeLabel(value: InstitutionType): string {
  return INSTITUTION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function institutionUseCaseLabel(value: InstitutionUseCase): string {
  return INSTITUTION_USE_CASE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function estimatedVolumeLabel(value: EstimatedVolumeRange): string {
  return ESTIMATED_VOLUME_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function validatePilotApplicationInput(
  payload: Record<string, unknown>,
): { data: PilotApplicationInput | null; errors: Record<string, string> } {
  const type = readString(payload, 'type')
  const fullName = readString(payload, 'fullName')
  const email = readString(payload, 'email')
  const organizationName = readString(payload, 'organizationName')
  const region = readString(payload, 'region')
  const notes = readString(payload, 'notes')

  const errors: Record<string, string> = {}

  if (type !== 'farmer' && type !== 'institution') {
    errors.type = 'Choose whether you are applying as a farmer or institution.'
  }
  if (!fullName) errors.fullName = 'Full name is required.'
  if (!email) {
    errors.email = 'Email is required.'
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!organizationName) errors.organizationName = 'Organization name is required.'
  if (!region) errors.region = 'Region is required.'

  if (type === 'farmer') {
    const acreage = readString(payload, 'acreage')
    const primaryCrops = readString(payload, 'primaryCrops')

    if (!acreage) errors.acreage = 'Approximate acreage is required.'
    if (!primaryCrops) errors.primaryCrops = 'List your primary crops.'

    if (Object.keys(errors).length > 0) return { data: null, errors }

    return {
      data: {
        type: 'farmer',
        fullName,
        email,
        organizationName,
        region,
        notes,
        acreage,
        primaryCrops,
      },
      errors,
    }
  }

  if (type === 'institution') {
    const organizationType = readString(payload, 'organizationType')
    const useCase = readString(payload, 'useCase')
    const estimatedVolume = readString(payload, 'estimatedVolume')

    if (!INSTITUTION_TYPE_OPTIONS.some((option) => option.value === organizationType)) {
      errors.organizationType = 'Choose your organization type.'
    }
    if (!INSTITUTION_USE_CASE_OPTIONS.some((option) => option.value === useCase)) {
      errors.useCase = 'Choose how you plan to use PRI.'
    }
    if (!ESTIMATED_VOLUME_OPTIONS.some((option) => option.value === estimatedVolume)) {
      errors.estimatedVolume = 'Choose an estimated buying or financing volume.'
    }

    if (Object.keys(errors).length > 0) return { data: null, errors }

    const data: InstitutionPilotApplicationInput = {
      type: 'institution',
      fullName,
      email,
      organizationName,
      region,
      notes,
      organizationType: organizationType as InstitutionPilotApplicationInput['organizationType'],
      useCase: useCase as InstitutionPilotApplicationInput['useCase'],
      estimatedVolume: estimatedVolume as InstitutionPilotApplicationInput['estimatedVolume'],
    }

    return { data, errors }
  }

  return { data: null, errors }
}
