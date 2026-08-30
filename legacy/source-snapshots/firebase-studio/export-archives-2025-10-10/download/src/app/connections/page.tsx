
import { AffiliateConnectionForm } from '@/components/AffiliateConnectionForm';
import { Plug } from 'lucide-react';

export default function ConnectionsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <Plug className="h-8 w-8" />
        Affiliate Connections
      </h1>
      <p className="text-muted-foreground">
        Manage your connections to affiliate platforms and data sources here. Credentials are stored securely.
      </p>
      <AffiliateConnectionForm />
    </div>
  );
}
