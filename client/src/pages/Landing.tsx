import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy-main to-navy-light">
      {/* Header */}
      <header className="border-b border-navy-light/20 bg-navy-main/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-green to-accent-orange rounded-xl flex items-center justify-center font-bold text-sm">
              C9K
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">CHONK9K</h1>
              <p className="text-xs text-text-secondary">Whale Manager</p>
            </div>
          </div>
          <Button onClick={handleLogin} className="bg-accent-green hover:bg-accent-green/80">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-accent-green/10 text-accent-green border-accent-green/20">
            Professional Solana Whale Tracking
          </Badge>
          
          <h1 className="text-5xl font-bold text-white mb-6">
            Track <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-orange">CHONK9K</span> Whales in Real-Time
          </h1>
          
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Professional-grade whale tracking platform for CHONK9K token with real-time monitoring, 
            advanced analytics, and intelligent alerts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-accent-green hover:bg-accent-green/80 text-navy-dark font-semibold px-8"
            >
              Start Tracking Whales
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-accent-orange text-accent-orange hover:bg-accent-orange/10"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything You Need to Track Smart Money
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Monitor whale movements, receive instant alerts, and make informed trading decisions 
            with our comprehensive tracking platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-eye text-accent-green text-xl"></i>
              </div>
              <CardTitle className="text-white">Real-Time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Track whale wallets in real-time with WebSocket-powered updates. 
                Never miss a significant movement again.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-bell text-accent-orange text-xl"></i>
              </div>
              <CardTitle className="text-white">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Custom alerts via Discord, Slack, and Telegram. Set conditions 
                and get notified when whales make their moves.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-line text-purple-500 text-xl"></i>
              </div>
              <CardTitle className="text-white">Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Comprehensive charts, trend analysis, and historical data 
                to understand whale behavior patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-download text-yellow-500 text-xl"></i>
              </div>
              <CardTitle className="text-white">Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Export whale data in CSV or JSON format for your own analysis 
                and record keeping.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-mobile-alt text-blue-500 text-xl"></i>
              </div>
              <CardTitle className="text-white">Mobile Optimized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Fully responsive design optimized for mobile trading. 
                Track whales on the go from any device.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-red-500 text-xl"></i>
              </div>
              <CardTitle className="text-white">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Enterprise-grade security with 99.9% uptime. Your data is safe 
                and always accessible when you need it.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-text-secondary">Start free, upgrade as you grow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <CardTitle className="text-white text-center">Free</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-text-secondary">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Basic whale tracking
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  5 alerts per day
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Top 10 whales
                </li>
              </ul>
              <Button onClick={handleLogin} className="w-full" variant="outline">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-accent-green relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-accent-green text-navy-dark">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-white text-center">Pro</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold text-white">$99</span>
                <span className="text-text-secondary">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Unlimited alerts
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Full whale database
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Export data
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  API access
                </li>
              </ul>
              <Button onClick={handleLogin} className="w-full bg-accent-green hover:bg-accent-green/80 text-navy-dark">
                Start Pro Trial
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-navy-main border-navy-light">
            <CardHeader>
              <CardTitle className="text-white text-center">Enterprise</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold text-white">$299</span>
                <span className="text-text-secondary">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  AI-powered insights
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  White-label solutions
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Priority support
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-accent-green mr-2"></i>
                  Custom integrations
                </li>
              </ul>
              <Button onClick={handleLogin} className="w-full" variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-light/20 bg-navy-main/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-green to-accent-orange rounded-lg flex items-center justify-center font-bold text-xs">
                C9K
              </div>
              <span className="text-text-secondary">
                © 2025 CHONK9K Whale Manager. Professional whale tracking platform.
              </span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
                Privacy
              </Button>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
                Support
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
