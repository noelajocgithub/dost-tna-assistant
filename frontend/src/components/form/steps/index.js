import EnterpriseInfo from './EnterpriseInfo'
import BusinessProfile from './BusinessProfile'
import Workforce from './Workforce'
import BusinessAssessment from './BusinessAssessment'
import Production from './Production'
import Marketing from './Marketing'
import Finance from './Finance'
import HumanResources from './HumanResources'

// Ordered list of the 8 data-bearing steps. Step 9 (Review) is handled
// separately by the wizard. `tab` is the short label for the tab strip.
export const STEPS = [
  { key: 'enterprise_info', title: 'Enterprise Information', tab: 'Enterprise', Component: EnterpriseInfo },
  { key: 'business_profile', title: 'Business Profile', tab: 'Profile', Component: BusinessProfile },
  { key: 'workforce', title: 'Workforce', tab: 'Workforce', Component: Workforce },
  { key: 'business_assessment', title: 'Business Assessment', tab: 'Assessment', Component: BusinessAssessment },
  { key: 'production', title: 'Production & Supply Chain', tab: 'Production', Component: Production },
  { key: 'marketing', title: 'Marketing', tab: 'Marketing', Component: Marketing },
  { key: 'finance', title: 'Finance', tab: 'Finance', Component: Finance },
  { key: 'human_resources', title: 'Human Resources', tab: 'HR', Component: HumanResources },
]
