import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Trophy, Users, Coins } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                The Fastest
                <span className="gradient-text"> Wheel</span>
                in the Ecosystem
              </h1>
              <p className="text-muted text-lg max-w-md">
                Spin, play, win, and earn rewards in real-time multiplayer battles. Join thousands of players competing for the ultimate prize.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="btn-primary w-full sm:w-auto">
                    Start Playing Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/play">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                <div className="absolute top-1/3 right-0 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
              </div>
              <div className="relative text-center">
                <div className="text-6xl font-bold gradient-text mb-2">🎡</div>
                <p className="text-muted">Interactive Wheel Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose Spinlana?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 border border-border">
              <Zap className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
              <p className="text-muted text-sm">
                Spin and get results instantly with our optimized platform.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 border border-border">
              <Trophy className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-2">Compete & Win</h3>
              <p className="text-muted text-sm">
                Face off against players worldwide and climb the leaderboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 border border-border">
              <Users className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-2">Multiplayer</h3>
              <p className="text-muted text-sm">
                Play with friends in real-time tournaments and challenges.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background rounded-xl p-6 border border-border">
              <Coins className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-2">Earn Rewards</h3>
              <p className="text-muted text-sm">
                Win real rewards, cash, and exclusive badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">50K+</p>
              <p className="text-muted">Active Players</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">$10M+</p>
              <p className="text-muted">Rewards Distributed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">24/7</p>
              <p className="text-muted">Non-Stop Action</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container-main">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Spin?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of players earning rewards. No download needed, play instantly in your browser.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="btn-secondary">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
