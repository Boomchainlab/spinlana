'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/lib/hooks/useWallet';
import {
  getActiveCampaigns,
  getUserPendingRewards,
  getActiveProposals,
  claimRewardToWallet,
  voteOnProposal,
  RewardCampaign,
  UserReward,
  GovernanceProposal,
} from '@/lib/tokenRewardsUtils';
import {
  Gift,
  Zap,
  Vote,
  TrendingUp,
  AlertCircle,
  Clock,
  Check,
  X,
} from 'lucide-react';

export default function Web3RewardsPage() {
  const { account, isConnected } = useWallet();
  const [campaigns, setCampaigns] = useState<RewardCampaign[]>([]);
  const [pendingRewards, setPendingRewards] = useState<UserReward[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [account, isConnected]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsData, proposalsData] = await Promise.all([
        getActiveCampaigns(),
        getActiveProposals(),
      ]);

      setCampaigns(campaignsData);
      setProposals(proposalsData);

      if (account) {
        const rewards = await getUserPendingRewards(account);
        setPendingRewards(rewards);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!account || pendingRewards.length === 0) return;

    setIsClaiming(true);
    try {
      const totalAmount = pendingRewards
        .reduce((sum, reward) => sum + parseFloat(reward.amount), 0)
        .toString();

      await claimRewardToWallet(account, totalAmount);
      setPendingRewards([]);
      alert('Rewards claimed successfully!');
      loadData();
    } catch (err: any) {
      alert('Error claiming rewards: ' + err.message);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleVote = async (proposalId: string, voteFor: boolean) => {
    if (!account) {
      alert('Please connect your wallet');
      return;
    }

    setVoting(proposalId);
    try {
      await voteOnProposal(proposalId, account, voteFor);
      alert('Vote cast successfully!');
      loadData();
    } catch (err: any) {
      alert('Error casting vote: ' + err.message);
    } finally {
      setVoting(null);
    }
  };

  const totalPendingRewards = pendingRewards.reduce(
    (sum, reward) => sum + parseFloat(reward.amount),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
            Token Rewards & Governance
          </h1>
          <p className="text-lg text-slate-300">
            Earn SPIN rewards and participate in decentralized governance
          </p>
        </div>

        {/* Pending Rewards Card */}
        {isConnected && (
          <Card className="mb-8 border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-500" />
                Your Pending Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Total Pending</p>
                <p className="text-4xl font-bold text-green-400">{totalPendingRewards.toFixed(2)} SPIN</p>
              </div>

              {pendingRewards.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex justify-between items-center bg-slate-900/50 rounded p-3"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">{reward.type}</p>
                        <p className="text-xs text-slate-400">
                          {reward.createdAt.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-green-400">{reward.amount}</p>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleClaimRewards}
                disabled={isClaiming || pendingRewards.length === 0 || !isConnected}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isClaiming ? 'Claiming...' : 'Claim All Rewards'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Reward Campaigns
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Governance
            </TabsTrigger>
          </TabsList>

          {/* Reward Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400">Loading campaigns...</div>
            ) : campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-slate-700/50 hover:border-green-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{campaign.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {campaign.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Reward Amount */}
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Reward per Claim</p>
                        <p className="text-2xl font-bold text-green-400">{campaign.rewardAmount} SPIN</p>
                      </div>

                      {/* Claims Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-slate-400">Claims</p>
                          <p className="text-sm font-semibold">
                            {campaign.totalClaims}/{campaign.maxClaims}
                          </p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${(campaign.totalClaims / campaign.maxClaims) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Time Remaining */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">
                          Ends{' '}
                          {campaign.endDate.toDate().toLocaleDateString()}
                        </span>
                      </div>

                      {/* Criteria */}
                      <div className="bg-slate-900/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Criteria</p>
                        <p className="text-sm">{campaign.criteria}</p>
                      </div>

                      {/* Claim Button */}
                      <Button
                        variant="outline"
                        className="w-full border-green-500/20 hover:bg-green-500/10"
                        disabled={!isConnected || campaign.totalClaims >= campaign.maxClaims}
                      >
                        Claim Reward
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-slate-700/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <Gift className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">No active campaigns</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400">Loading proposals...</div>
            ) : proposals.length > 0 ? (
              <div className="space-y-6">
                {proposals.map((proposal) => {
                  const totalVotes = proposal.voteFor + proposal.voteAgainst;
                  const forPercentage = totalVotes > 0 ? (proposal.voteFor / totalVotes) * 100 : 0;

                  return (
                    <Card key={proposal.id} className="border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{proposal.title}</CardTitle>
                        <CardDescription>
                          Proposed by {proposal.proposedBy.slice(0, 6)}...
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Description */}
                        <p className="text-slate-300">{proposal.description}</p>

                        {/* Voting Stats */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                For
                              </span>
                              <span className="text-sm font-semibold text-green-400">
                                {proposal.voteFor} ({forPercentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${forPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <X className="w-4 h-4 text-red-500" />
                                Against
                              </span>
                              <span className="text-sm font-semibold text-red-400">
                                {proposal.voteAgainst} ({100 - forPercentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all"
                                style={{ width: `${100 - forPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Time Remaining */}
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          Voting ends {proposal.endTime.toDate().toLocaleDateString()}
                        </div>

                        {/* Vote Buttons */}
                        {proposal.status === 'active' && (
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleVote(proposal.id, true)}
                              disabled={voting === proposal.id || !isConnected}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Vote For
                            </Button>
                            <Button
                              onClick={() => handleVote(proposal.id, false)}
                              disabled={voting === proposal.id || !isConnected}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Vote Against
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-slate-700/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <Vote className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">No active proposals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-12 border-slate-700/50">
          <CardHeader>
            <CardTitle>How Rewards & Governance Work</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-500" />
                Reward Campaigns
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Participate in daily campaigns to earn SPIN tokens</li>
                <li>• Complete specific criteria to qualify for rewards</li>
                <li>• Claim rewards directly to your wallet</li>
                <li>• Limited slots per campaign to ensure fairness</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Vote className="w-5 h-5 text-blue-500" />
                Community Governance
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Vote on protocol changes and feature proposals</li>
                <li>• One vote per connected wallet</li>
                <li>• Proposals require majority vote to pass</li>
                <li>• All votes are transparent and recorded on-chain</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
