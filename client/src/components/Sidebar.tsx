import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex lg:w-64 bg-navy-main border-r border-navy-light flex-col fixed h-full z-30">
        <div className="p-6 border-b border-navy-light">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-green to-accent-orange rounded-xl flex items-center justify-center font-bold text-lg">
              C9K
            </div>
            <div>
              <h1 className="text-xl font-semibold">CHONK9K</h1>
              <p className="text-sm text-text-secondary">Whale Manager</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-accent-green bg-opacity-10 text-accent-green">
                <i className="fas fa-chart-line w-5"></i>
                <span className="font-medium">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-navy-light transition-colors text-text-secondary hover:text-white">
                <i className="fas fa-fish w-5"></i>
                <span>Whale Tracker</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-navy-light transition-colors text-text-secondary hover:text-white">
                <i className="fas fa-bell w-5"></i>
                <span>Alerts</span>
                <Badge className="ml-auto bg-accent-orange text-navy-dark text-xs">3</Badge>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-navy-light transition-colors text-text-secondary hover:text-white">
                <i className="fas fa-download w-5"></i>
                <span>Export Data</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-navy-light transition-colors text-text-secondary hover:text-white">
                <i className="fas fa-cog w-5"></i>
                <span>Settings</span>
              </a>
            </li>
          </ul>

          {/* Subscription Status */}
          <div className="mt-8 p-4 bg-gradient-to-r from-accent-green to-accent-orange rounded-lg">
            <div className="flex items-center space-x-2 text-navy-dark">
              <i className="fas fa-crown"></i>
              <span className="font-semibold capitalize">{user?.subscriptionTier || 'Free'} Plan</span>
            </div>
            <p className="text-sm text-navy-dark opacity-80 mt-1">
              {user?.subscriptionTier === 'pro' ? 'Advanced whale tracking' : 
               user?.subscriptionTier === 'enterprise' ? 'Full enterprise features' : 
               'Basic whale tracking'}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-3 text-sm font-medium text-navy-dark hover:bg-black/10 p-0 h-auto"
            >
              Manage subscription
            </Button>
          </div>
        </div>

        {/* Connection Status & Logout */}
        <div className="p-4 border-t border-navy-light">
          <div className="flex items-center space-x-2 text-sm mb-3">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span className="text-text-secondary">Connected to Solana</span>
          </div>
          <div className="flex items-center space-x-2 text-sm mb-4">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span className="text-text-secondary">WebSocket Active</span>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm" 
            className="w-full text-text-secondary border-navy-light hover:bg-navy-light"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Sign Out
          </Button>
        </div>
      </nav>
    </>
  );
}
