'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronDown, GraduationCap, Activity, Users, Clock, Search, ChevronRight, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Submission {
  timestamp: string | Date  // Allow both string and Date types
  completed: boolean
}

interface WeeklyProgress {
  trainings: Submission[]
  boldActions: Submission[]
  standups: Submission[]
}

interface WeeklyData {
  trainings: Submission[]
  boldActions: Submission[]
  standups: Submission[]
  weekStartDate: Date
}

interface FourWeekProgress {
  weeklyData: WeeklyData[]
  totalTrainings: number
  totalBoldActions: number
  totalStandups: number
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  weeklyProgress: WeeklyProgress
  fourWeekProgress?: FourWeekProgress
}

interface TeamMetrics {
  supervisorName: string
  teamSize: number
  members: TeamMember[]
}

interface ExecutiveOverviewProps {
  teams: TeamMetrics[]
}

interface CalculatedMetrics {
  trainingPercentage: number
  boldActionPercentage: number
  standupPercentage: number
  expectedWeeklyTrainings: number
  expectedBoldActions: number
  expectedWeeklyStandups: number
}

const StatusDot = ({ percentage }: { percentage: number }) => {
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
}

const CompactMetric = ({ completed, total }: { completed: number; total: number }) => {
  const percentage = (completed / total) * 100
  const color = percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
  return (
    <span className={`font-medium ${color}`}>
      {completed}/{total}
    </span>
  )
}

// Helper functions to check if activities are completed this week
const isThisWeek = (timestamp: any): boolean => {
  if (!timestamp) return false;
  
  let date: Date;
  // Handle Firestore Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  }
  // Handle Date object
  else if (timestamp instanceof Date) {
    date = timestamp;
  }
  // Handle string
  else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  }
  // Handle seconds timestamp
  else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  }
  else {
    return false;
  }

  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  return date >= startOfWeek && date <= endOfWeek;
}

const hasCompletedThisWeek = (submissions: Submission[] = []): boolean => {
  if (!Array.isArray(submissions)) return false;
  return submissions.some(s => s.completed && isThisWeek(s.timestamp));
}

const DetailedMetrics = ({ team }: { team: TeamMetrics }) => {
  // Calculate totals for the footer
  const totalTrainings = team.members.reduce((total, member) => 
    total + (hasCompletedThisWeek(member.weeklyProgress?.trainings) ? 1 : 0), 0)
  
  const totalBoldActions = team.members.reduce((total, member) => 
    total + (hasCompletedThisWeek(member.weeklyProgress?.boldActions) ? 1 : 0), 0)
  
  const totalStandups = team.members.reduce((total, member) => 
    total + (hasCompletedThisWeek(member.weeklyProgress?.standups) ? 1 : 0), 0)
  
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-2">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Training
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bold Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stand-up
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {team.members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle2 
                      className={`w-5 h-5 ${
                        hasCompletedThisWeek(member.weeklyProgress?.trainings)
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle2 
                      className={`w-5 h-5 ${
                          hasCompletedThisWeek(member.weeklyProgress?.boldActions)
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle2 
                      className={`w-5 h-5 ${
                          hasCompletedThisWeek(member.weeklyProgress?.standups)
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Completed
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {totalTrainings} / {team.teamSize}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {totalBoldActions} / {team.teamSize}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {totalStandups} / {team.teamSize}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const FourWeekMetrics = ({ team }: { team: TeamMetrics }) => {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-2">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="grid grid-cols-16 gap-4">
              <th className="col-span-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Member
              </th>
              {team.members[0]?.fourWeekProgress?.weeklyData.map((week, index) => (
                <th key={index} className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {team.members.map((member) => (
              <tr key={member.id} className="grid grid-cols-16 gap-4">
                <td className="col-span-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </td>
                {member.fourWeekProgress?.weeklyData.map((week, index) => (
                  <td key={index} className="col-span-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle2 
                          className={`w-4 h-4 ${
                            week.trainings.some(t => t.completed) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <span className="ml-2">Training</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 
                          className={`w-4 h-4 ${
                            week.boldActions.some(b => b.completed) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <span className="ml-2">Bold Action</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 
                          className={`w-4 h-4 ${
                            week.standups.some(s => s.completed) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <span className="ml-2">Standup</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="grid grid-cols-16 gap-4 bg-gray-50">
              <td className="col-span-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                4-Week Summary
              </td>
              <td className="col-span-12 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    Trainings: {team.members.reduce((sum, member) => 
                      sum + (member.fourWeekProgress?.totalTrainings || 0), 0)} / {team.teamSize * 4}
                  </div>
                  <div>
                    Bold Actions: {team.members.reduce((sum, member) => 
                      sum + (member.fourWeekProgress?.totalBoldActions || 0), 0)} / {team.teamSize * 4}
                  </div>
                  <div>
                    Standups: {team.members.reduce((sum, member) => 
                      sum + (member.fourWeekProgress?.totalStandups || 0), 0)} / {team.teamSize * 4}
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const SupervisorRow = ({ team }: { team: TeamMetrics }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate weekly totals
  const weeklyTotals = {
    trainings: team.members.reduce((total, member) => 
      total + (hasCompletedThisWeek(member.weeklyProgress?.trainings) ? 1 : 0), 0),
    boldActions: team.members.reduce((total, member) => 
      total + (hasCompletedThisWeek(member.weeklyProgress?.boldActions) ? 1 : 0), 0),
    standups: team.members.reduce((total, member) => 
      total + (hasCompletedThisWeek(member.weeklyProgress?.standups) ? 1 : 0), 0)
  }

  // Calculate 4-week totals
  const fourWeekTotals = {
    trainings: team.members.reduce((total, member) => 
      total + (member.fourWeekProgress?.totalTrainings || 0), 0),
    boldActions: team.members.reduce((total, member) => 
      total + (member.fourWeekProgress?.totalBoldActions || 0), 0),
    standups: team.members.reduce((total, member) => 
      total + (member.fourWeekProgress?.totalStandups || 0), 0)
  }

  // Calculate percentages for both weekly and 4-week metrics
  const metrics = {
    weekly: {
      trainingPercentage: (weeklyTotals.trainings / team.teamSize) * 100,
      boldActionPercentage: (weeklyTotals.boldActions / team.teamSize) * 100,
      standupPercentage: (weeklyTotals.standups / team.teamSize) * 100
    },
    fourWeek: {
      trainingPercentage: (fourWeekTotals.trainings / (team.teamSize * 4)) * 100,
      boldActionPercentage: (fourWeekTotals.boldActions / (team.teamSize * 4)) * 100,
      standupPercentage: (fourWeekTotals.standups / (team.teamSize * 4)) * 100
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-4">
            <div className="flex items-center gap-3">
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform mt-1",
                  isExpanded && "transform rotate-180"
                )} 
              />
              <div>
                <div className="font-medium text-gray-900">{team.supervisorName}</div>
                <div className="text-sm text-gray-500">{team.teamSize} members</div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex items-start gap-2">
              <StatusDot percentage={metrics.weekly.trainingPercentage} />
              <div>
                <div className="font-medium text-gray-900">{weeklyTotals.trainings}/{team.teamSize}</div>
                <div className="text-sm text-gray-500">4w: {fourWeekTotals.trainings}/{team.teamSize * 4}</div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex items-start gap-2">
              <StatusDot percentage={metrics.weekly.boldActionPercentage} />
              <div>
                <div className="font-medium text-gray-900">{weeklyTotals.boldActions}/{team.teamSize}</div>
                <div className="text-sm text-gray-500">4w: {fourWeekTotals.boldActions}/{team.teamSize * 4}</div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex items-start gap-2">
              <StatusDot percentage={metrics.weekly.standupPercentage} />
              <div>
                <div className="font-medium text-gray-900">{weeklyTotals.standups}/{team.teamSize}</div>
                <div className="text-sm text-gray-500">4w: {fourWeekTotals.standups}/{team.teamSize * 4}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isExpanded && <DetailedMetrics team={team} />}
    </div>
  )
}

export default function ExecutiveOverview({ teams }: ExecutiveOverviewProps) {
  return (
    <Card className="bg-white rounded-none border-0 mb-8">
      <CardHeader className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-white">Team Performance</CardTitle>
            <p className="text-white/80">Weekly supervisor metrics and team progress tracking</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Refresh Data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Input
          type="text"
          placeholder="Find supervisor..."
          className="mb-4 bg-white text-[#333333] border-gray-200"
        />
        {teams.map((team, index) => (
          <SupervisorRow key={index} team={team} />
        ))}
      </CardContent>
    </Card>
  )
} 
