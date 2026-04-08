/**
 * pages/AccountsPage.jsx — unchanged in logic, uses real useAccounts hook.
 */

import { useAccounts }   from '@/hooks/useAccounts'
import PageHeader        from '@/components/ui/PageHeader'
import InfoBanner        from '@/components/ui/InfoBanner'
import AccountCard       from '@/components/AccountCard'
import { PLATFORM_KEYS } from '@/data/platforms'

export default function AccountsPage() {
  const { accounts, connecting, connectedCount, toggle } = useAccounts()

  return (
    <div>
      <PageHeader
        title="Connected Accounts"
        subtitle={`${connectedCount} of ${PLATFORM_KEYS.length} platforms connected`}
      />

      <InfoBanner>
        Connect your social media accounts to enable automatic publishing when you create a post.
      </InfoBanner>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PLATFORM_KEYS.map((key, i) => (
          <div key={key} style={{ animationDelay: `${i * 80}ms` }}>
            <AccountCard
              account={accounts[key]}
              connecting={connecting === key}
              onToggle={() => toggle(key)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
