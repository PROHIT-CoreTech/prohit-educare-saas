/**
 * Helper to determine student quota limit by plan key or status.
 * - STARTER: 400
 * - PROFESSIONAL: 1,500
 * - ENTERPRISE: -1 (Unlimited)
 */
export function getStudentLimitByPlan(planKey?: string): number {
  if (!planKey) return 400; // Default Starter/Trial limit

  const key = planKey.toUpperCase().trim();
  switch (key) {
    case 'STARTER':
    case 'STARTER_999':
    case 'TRIAL':
    case 'TRIAL_14':
      return 400;

    case 'PROFESSIONAL':
    case 'PROFESSIONAL_2999':
    case 'PRO':
      return 1500;

    case 'ENTERPRISE':
    case 'ENTERPRISE_7999':
    case 'UNLIMITED':
    case 'UNLIMITED_STUDENTS':
      return -1; // -1 represents Unlimited

    default:
      return 400;
  }
}

/**
 * Helper to determine max total branch capacity (Main + Additional) by plan key.
 * - STARTER / TRIAL: 2 (Main + 1 additional)
 * - PROFESSIONAL: 6 (Main + 5 additional)
 * - ENTERPRISE: 13 (Main + 12 additional)
 */
export function getBranchLimitByPlan(planKey?: string): number {
  if (!planKey) return 2; // Default Starter / Trial limit (Main + 1)

  const key = planKey.toUpperCase().trim();
  switch (key) {
    case 'STARTER':
    case 'STARTER_999':
    case 'TRIAL':
    case 'TRIAL_14':
      return 2; // Main + 1

    case 'PROFESSIONAL':
    case 'PROFESSIONAL_2999':
    case 'PRO':
      return 6; // Main + 5

    case 'ENTERPRISE':
    case 'ENTERPRISE_7999':
    case 'UNLIMITED':
      return 13; // Main + 12

    default:
      return 2;
  }
}


