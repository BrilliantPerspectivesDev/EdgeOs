'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronDown, GraduationCap, Activity, Users, Clock, Search, ChevronRight, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns'

interface Submission {
  timestamp: string | Date
  completed: boolean
}

interface WeeklyProgress {
  trainings: Submission[]
  boldActions: Submission[]
  standups: Submission[]
  weekStartDate: Date
}

interface WeeklyData {
  trainings: Submission[]
  boldActions: Submission[]
  standups: Submission[]
  weekStartDate: Date
}

interface FourWeekProgress {
  weeklyData?: {
    trainings: { completed: boolean; timestamp: Date }[];
    boldActions: { completed: boolean; timestamp: Date }[];
    standups: { completed: boolean; timestamp: Date }[];
  }[];
  totalTrainings: number;
  totalBoldActions: number;
  totalStandups: number;
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  weeklyProgress: WeeklyProgress
  allWeeklyData: WeeklyData[]
  fourWeekProgress?: FourWeekProgress
}

interface TeamMetrics {
  supervisorName: string
  teamSize: number
  members: TeamMember[]
}

interface ExecutiveOverviewProps {
  weeklyTrainings: { completed: number; total: number }
  weeklyBoldActions: { completed: number; total: number }
  weeklyStandups: { completed: number; total: number }
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

const wasCompletedInWeek = (activities: any[] | undefined, weekIndex: number): boolean => {
  if (!activities || activities.length === 0) return false;

  const now = new Date();
  const weekStart = startOfWeek(subWeeks(now, weekIndex));
  const weekEnd = endOfWeek(subWeeks(now, weekIndex));

  // Set precise start and end times for the week
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);

  return activities.some(activity => {
    try {
      // Get the timestamp, handling different possible formats
      let timestamp: Date;
      if (activity.timestamp instanceof Date) {
        timestamp = activity.timestamp;
      } else if (activity.timestamp?.toDate) {
        timestamp = activity.timestamp.toDate();
      } else if (activity.timestamp) {
        timestamp = new Date(activity.timestamp);
      } else if (activity.completedAt?.toDate) {
        timestamp = activity.completedAt.toDate();
      } else if (activity.completedAt) {
        timestamp = new Date(activity.completedAt);
      } else if (activity.scheduledFor?.toDate) {
        timestamp = activity.scheduledFor.toDate();
      } else if (activity.scheduledFor) {
        timestamp = new Date(activity.scheduledFor);
      } else {
        return false;
      }

      // Check if the activity is completed and falls within the week
      const isCompleted = activity.completed === true || 
                         activity.status === 'completed' ||
                         (activity.videoCompleted === true && activity.worksheetCompleted === true);

      return isCompleted && isWithinInterval(timestamp, { start: weekStart, end: weekEnd });
    } catch (error) {
      console.error('Error processing activity date:', error);
      return false;
    }
  });
};

// Helper function to get the date range for a week
const getWeekRange = (weekIndex: number): { start: Date; end: Date } => {
  const now = new Date();
  const weekStart = startOfWeek(subWeeks(now, weekIndex));
  const weekEnd = endOfWeek(subWeeks(now, weekIndex));
  
  // Set times to start and end of day for precise comparison
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { start: weekStart, end: weekEnd };
}

const DetailedMetrics = ({ team }: { team: TeamMetrics }) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  // Get weekly data from all team members
  const hasWeeklyData = team.members.some(member => 
    member.allWeeklyData?.[currentWeekIndex] !== undefined
  )

  console.log('DetailedMetrics data check:', {
    teamName: team.supervisorName,
    currentWeekIndex,
    membersCount: team.members.length,
    hasWeeklyData,
    membersWithData: team.members.map(member => ({
      name: `${member.firstName} ${member.lastName}`,
      hasData: member.allWeeklyData?.[currentWeekIndex] ? {
        trainings: member.allWeeklyData[currentWeekIndex].trainings.length,
        boldActions: member.allWeeklyData[currentWeekIndex].boldActions.length,
        standups: member.allWeeklyData[currentWeekIndex].standups.length
      } : null
    }))
  });

  // Get the first member that has data for date display
  const memberWithData = team.members.find(member => 
    member.allWeeklyData?.[currentWeekIndex] !== undefined
  )

  // If we don't have any data at all, show a message
  if (!hasWeeklyData || !memberWithData?.allWeeklyData?.[currentWeekIndex]) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-2 text-center text-gray-500">
        No data available for this week
      </div>
    )
  }

  const handlePreviousWeek = () => {
    const newIndex = Math.min(3, currentWeekIndex + 1)
    console.log('Moving to previous week:', { currentIndex: currentWeekIndex, newIndex })
    setCurrentWeekIndex(newIndex)
  }

  const handleNextWeek = () => {
    const newIndex = Math.max(0, currentWeekIndex - 1)
    console.log('Moving to next week:', { currentIndex: currentWeekIndex, newIndex })
    setCurrentWeekIndex(newIndex)
  }

  // Get the date range for the current week
  const weekStartDate = memberWithData.allWeeklyData[currentWeekIndex].weekStartDate
  const weekStart = format(weekStartDate, 'MMM d')
  const weekEnd = format(new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000), 'MMM d')

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-2">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <Button
          onClick={handlePreviousWeek}
          disabled={currentWeekIndex === 3}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          Previous Week
        </Button>
        <div className="text-sm font-medium text-gray-700">
          {weekStart} - {weekEnd}
        </div>
        <Button
          onClick={handleNextWeek}
          disabled={currentWeekIndex === 0}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          Next Week
        </Button>
      </div>

      {/* Weekly Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-1/4">
                Team Member
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-1/4">
                Training
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-1/4">
                Bold Action
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-1/4">
                Standup
              </th>
            </tr>
          </thead>
          <tbody>
            {team.members.map((member) => {
              const weekData = member.allWeeklyData?.[currentWeekIndex];
              const isTrainingCompleted = weekData?.trainings.some(t => t.completed) || false;
              const isBoldActionCompleted = weekData?.boldActions.some(b => b.completed) || false;
              const isStandupCompleted = weekData?.standups.some(s => s.completed) || false;

              console.log(`Member completion status for week ${currentWeekIndex}:`, {
                name: `${member.firstName} ${member.lastName}`,
                weekData: weekData ? {
                  trainings: weekData.trainings.length,
                  boldActions: weekData.boldActions.length,
                  standups: weekData.standups.length
                } : null,
                isTrainingCompleted,
                isBoldActionCompleted,
                isStandupCompleted
              });

              return (
                <tr key={member.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${isTrainingCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="ml-2">{isTrainingCompleted ? 'Completed' : 'Not Completed'}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${isBoldActionCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="ml-2">{isBoldActionCompleted ? 'Completed' : 'Not Completed'}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${isStandupCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="ml-2">{isStandupCompleted ? 'Completed' : 'Not Completed'}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td className="py-3 text-sm font-medium text-gray-900">
                Weekly Totals
              </td>
              <td className="py-3 text-sm text-gray-500">
                {team.members.filter(m => m.allWeeklyData?.[currentWeekIndex]?.trainings.some(t => t.completed)).length}/{team.teamSize}
              </td>
              <td className="py-3 text-sm text-gray-500">
                {team.members.filter(m => m.allWeeklyData?.[currentWeekIndex]?.boldActions.some(b => b.completed)).length}/{team.teamSize}
              </td>
              <td className="py-3 text-sm text-gray-500">
                {team.members.filter(m => m.allWeeklyData?.[currentWeekIndex]?.standups.some(s => s.completed)).length}/{team.teamSize}
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
              {team.members[0]?.fourWeekProgress?.weeklyData?.map((_, index: number) => (
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
                {member.fourWeekProgress?.weeklyData?.map((week, index: number) => (
                  <td key={index} className="col-span-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle2 
                          className={`w-4 h-4 ${
                            week.trainings.some((t: { completed: boolean }) => t.completed) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <span className="ml-2">Training</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 
                          className={`w-4 h-4 ${
                            week.boldActions.some((b: { completed: boolean }) => b.completed) ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <span className="ml-2">Bold Action</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 
                          className={`w-4 h-4 ${
                            week.standups.some((s: { completed: boolean }) => s.completed) ? 'text-green-500' : 'text-gray-300'
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

  // Calculate weekly totals for the current week (index 0)
  const weeklyTotals = {
    trainings: team.members.reduce((total, member) => 
      total + (wasCompletedInWeek(member.weeklyProgress?.trainings, 0) ? 1 : 0), 0),
    boldActions: team.members.reduce((total, member) => {
      // Check if the member has any completed bold actions for the current week
      const hasCompletedBoldAction = wasCompletedInWeek(member.weeklyProgress?.boldActions, 0);
      if (hasCompletedBoldAction) {
        console.log(`Found completed bold action for member: ${member.firstName} ${member.lastName}`);
      }
      return total + (hasCompletedBoldAction ? 1 : 0);
    }, 0),
    standups: team.members.reduce((total, member) => 
      total + (wasCompletedInWeek(member.weeklyProgress?.standups, 0) ? 1 : 0), 0)
  }

  // Log weekly totals for debugging
  console.log('Weekly totals:', {
    supervisorName: team.supervisorName,
    totals: weeklyTotals,
    teamSize: team.teamSize
  });

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

export default function ExecutiveOverview({ 
  teams,
  weeklyTrainings,
  weeklyBoldActions,
  weeklyStandups 
}: ExecutiveOverviewProps) {
  return (
    <Card className="bg-white rounded-none border-0 mb-8">
      <CardHeader className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-white">Team Performance</CardTitle>
            <p className="text-white/80">Weekly supervisor metrics and team progress tracking</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-white/80">
                <span className="font-medium">Trainings:</span> {weeklyTrainings.completed}/{weeklyTrainings.total}
              </div>
              <div className="text-white/80">
                <span className="font-medium">Bold Actions:</span> {weeklyBoldActions.completed}/{weeklyBoldActions.total}
              </div>
              <div className="text-white/80">
                <span className="font-medium">Standups:</span> {weeklyStandups.completed}/{weeklyStandups.total}
              </div>
            </div>
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
