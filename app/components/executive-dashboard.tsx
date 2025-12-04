'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from '@/lib/auth-context'
import { toast } from "@/components/ui/use-toast"
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, DocumentData } from 'firebase/firestore'
import { startOfWeek } from 'date-fns'
import ExecutiveOverview from './executive-overview'
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface BoldAction {
  id: string
  action: string
  status: 'active' | 'completed'
  createdAt: Date
  timeframe: string
}

interface Training {
  id: string
  title: string
  completedAt: Date
}

interface User {
  id: string
  firstName: string
  lastName: string
  role: string
  supervisorId: string
  latestBoldAction?: BoldAction
  latestTraining?: Training
}

interface WeeklyData {
  trainings: { completed: boolean; timestamp: Date }[]
  boldActions: { completed: boolean; timestamp: Date }[]
  standups: { completed: boolean; timestamp: Date }[]
  weekStartDate: Date
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  role: string
  supervisorId: string
  weeklyProgress: WeeklyData
  allWeeklyData: WeeklyData[]
  fourWeekProgress?: any // TODO: Define specific type if needed
}

interface TeamMetrics {
  supervisorName: string
  teamSize: number
  members: TeamMember[]
}

interface WeeklyMetrics {
  trainings: { completed: number; total: number }
  boldActions: { completed: number; total: number }
  standups: { completed: number; total: number }
  teams: TeamMetrics[]
}

interface CacheData {
  metrics: WeeklyMetrics;
  users: User[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = 'executiveDashboardCache';

const formatDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (dateValue.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
  return new Date(dateValue);
};

const formatDisplayDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default function ExecutiveDashboard() {
  const { userRole, companyName } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics>({
    trainings: { completed: 0, total: 0 },
    boldActions: { completed: 0, total: 0 },
    standups: { completed: 0, total: 0 },
    teams: []
  })

  const getCachedData = (): CacheData | null => {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (!cached) return null;
    
    try {
      const parsedCache = JSON.parse(cached) as CacheData
      const now = Date.now()
      
      if (now - parsedCache.timestamp <= CACHE_DURATION) {
        return parsedCache
      }
    } catch (error) {
      console.error('Error parsing cached data:', error)
    }
    return null
  }

  const setCachedData = (metrics: WeeklyMetrics, users: User[]) => {
    const cacheData: CacheData = {
      metrics,
      users,
      timestamp: Date.now()
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  }

  const fetchUserWeeklyData = async (userId: string, supervisorId: string): Promise<WeeklyData[]> => {
    const now = new Date()
    const weeklyData: WeeklyData[] = []
    
    // Get data for the last 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(new Date(now))
      weekStart.setDate(weekStart.getDate() - (i * 7)) // Go back i weeks
      weekStart.setHours(0, 0, 0, 0) // Start of day
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6) // End of the week
      weekEnd.setHours(23, 59, 59, 999) // End of day

      console.log(`Fetching data for week ${i}:`, {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        userId,
        supervisorId
      })
      
      try {
        // Fetch trainings completed this week
        const progressRef = doc(db, `users/${userId}/progress/trainings`)
        const progressDoc = await getDoc(progressRef)
        const progressData = progressDoc.exists() ? progressDoc.data() : {}
        
        const trainings = Object.entries(progressData)
          .filter(([trainingId, data]: [string, any]) => {
            if (!data.lastUpdated) return false;
            
            let updateDate: Date;
            try {
              if (data.lastUpdated.toDate) {
                updateDate = data.lastUpdated.toDate();
              } else if (data.lastUpdated.seconds) {
                updateDate = new Date(data.lastUpdated.seconds * 1000);
              } else {
                updateDate = new Date(data.lastUpdated);
              }
              
              const updateTime = updateDate.getTime();
              const weekStartTime = weekStart.getTime();
              const weekEndTime = weekEnd.getTime();
              const isThisWeek = updateTime >= weekStartTime && updateTime <= weekEndTime;
              const isCompleted = data.videoCompleted === true && data.worksheetCompleted === true;
              
              console.log(`Training ${trainingId} check:`, {
                updateTime,
                weekStartTime,
                weekEndTime,
                isThisWeek,
                isCompleted
              });

              return isThisWeek && isCompleted;
            } catch (error) {
              console.error('Error processing training date:', error)
              return false;
            }
          })
          .map(([trainingId, data]: [string, any]) => {
            let timestamp: Date;
            if (data.lastUpdated.toDate) {
              timestamp = data.lastUpdated.toDate();
            } else if (data.lastUpdated.seconds) {
              timestamp = new Date(data.lastUpdated.seconds * 1000);
            } else {
              timestamp = new Date(data.lastUpdated);
            }
            
            return {
              completed: true,
              timestamp
            };
          });

        console.log(`Found ${trainings.length} completed trainings for week ${i}`);

        // Fetch bold actions for this week
        const boldActionsRef = collection(db, `users/${userId}/boldActions`)
        const completedBoldActionsQuery = query(
          boldActionsRef,
          where('status', '==', 'completed'),
          where('completedAt', '>=', weekStart),
          where('completedAt', '<=', weekEnd),
          orderBy('completedAt', 'desc')
        )
        const completedBoldActionsSnapshot = await getDocs(completedBoldActionsQuery)
        
        // Map completed bold actions
        const boldActions = completedBoldActionsSnapshot.docs.map(doc => {
          const data = doc.data()
          const timestamp = data.completedAt?.toDate?.() || new Date(data.completedAt)
          console.log(`Bold action completed at ${timestamp} for week ${i}:`, {
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            isWithinWeek: timestamp >= weekStart && timestamp <= weekEnd
          })
          return {
            completed: true,
            timestamp
          }
        })

        console.log(`Found ${boldActions.length} completed bold actions for week ${i}`);

        // Fetch standups for this week
        const standupsRef = collection(db, `users/${userId}/standups`)
        const completedStandupsQuery = query(
          standupsRef,
          where('completedAt', '>=', weekStart),
          where('completedAt', '<=', weekEnd),
          where('status', '==', 'completed'),
          where('supervisorId', '==', supervisorId),
          orderBy('completedAt', 'desc')
        )
        const completedStandupsSnapshot = await getDocs(completedStandupsQuery)

        const standups = completedStandupsSnapshot.docs.map(doc => {
          const data = doc.data()
          const timestamp = data.completedAt?.toDate?.() || new Date(data.completedAt)
          return {
            completed: true,
            timestamp
          }
        })

        console.log(`Found ${standups.length} completed standups for week ${i}`);

        // Always push data for the week, even if empty
        weeklyData.push({
          trainings,
          boldActions,
          standups,
          weekStartDate: weekStart
        })

        console.log(`Week ${i} data summary:`, {
          weekStart: weekStart.toISOString(),
          trainingsCount: trainings.length,
          boldActionsCount: boldActions.length,
          standupsCount: standups.length
        });

      } catch (error) {
        console.error(`Error fetching data for week ${i} for user ${userId}:`, error)
        // Still push an empty week data to maintain the array structure
        weeklyData.push({
          trainings: [],
          boldActions: [],
          standups: [],
          weekStartDate: weekStart
        })
      }
    }

    // Sort weeks from newest to oldest
    const sortedData = weeklyData.sort((a, b) => b.weekStartDate.getTime() - a.weekStartDate.getTime());
    
    console.log('Final weekly data:', sortedData);
    
    return sortedData;
  }

  const fetchUserFourWeekProgress = async (userId: string): Promise<{
    totalTrainings: number;
    totalBoldActions: number;
    totalStandups: number;
  }> => {
    const startOfThisWeek = startOfWeek(new Date())
    const fourWeeksAgo = new Date(startOfThisWeek)
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 21) // Go back 3 weeks (21 days) to get 4 weeks total

    try {
      // Fetch completed trainings
      const progressRef = doc(db, `users/${userId}/progress/trainings`)
      const progressDoc = await getDoc(progressRef)
      const progressData = progressDoc.exists() ? progressDoc.data() : {}
      
      const completedTrainings = Object.values(progressData).filter((data: any) => 
        data.videoCompleted && 
        data.worksheetCompleted && 
        data.lastUpdated?.toDate() >= fourWeeksAgo
      ).length

      // Fetch completed bold actions
      const boldActionsRef = collection(db, `users/${userId}/boldActions`)
      const boldActionsQuery = query(
        boldActionsRef,
        where('createdAt', '>=', fourWeeksAgo),
        where('status', '==', 'completed')
      )
      const boldActionsSnapshot = await getDocs(boldActionsQuery)

      // Fetch completed standups
      const standupsRef = collection(db, `users/${userId}/standups`)
      const standupsQuery = query(
        standupsRef,
        where('scheduledFor', '>=', fourWeeksAgo),
        where('status', '==', 'completed')
      )
      const standupsSnapshot = await getDocs(standupsQuery)

      return {
        totalTrainings: completedTrainings,
        totalBoldActions: boldActionsSnapshot.size,
        totalStandups: standupsSnapshot.size
      }
    } catch (error) {
      console.error(`Error fetching four week progress for user ${userId}:`, error)
      return {
        totalTrainings: 0,
        totalBoldActions: 0,
        totalStandups: 0
      }
    }
  }

  const fetchWeeklyMetrics = useCallback(async () => {
    try {
      if (!companyName) {
        console.error('Company name not available')
        return
      }

      setLoadingProgress(10)
      const usersRef = collection(db, 'users')
      // Query supervisors from the same company
      const supervisorsQuery = query(
        usersRef,
        where('companyName', '==', companyName),
        where('role', '==', 'supervisor')
      )
      const supervisorsSnapshot = await getDocs(supervisorsQuery)
      
      console.log(`Found ${supervisorsSnapshot.size} supervisors`);
      setLoadingProgress(30)

      let completedTrainings = 0
      let totalTrainings = 0
      let completedBoldActions = 0
      let totalBoldActions = 0
      let completedStandups = 0
      let totalStandups = 0
      const teamsMetrics = []

      const totalSupervisors = supervisorsSnapshot.docs.length
      let processedSupervisors = 0

      for (const supervisor of supervisorsSnapshot.docs) {
        const supervisorData = supervisor.data()
        console.log(`Processing supervisor: ${supervisorData.firstName} ${supervisorData.lastName}`);
        
        let teamSize = 0
        const teamMembers = []

        // Query team members for this supervisor from the same company
        const teamMembersQuery = query(
          usersRef,
          where('companyName', '==', companyName),
          where('supervisorId', '==', supervisor.id),
          where('role', '==', 'team_member')
        )
        const teamMembersSnapshot = await getDocs(teamMembersQuery)
        teamSize = teamMembersSnapshot.size
        
        console.log(`Found ${teamSize} team members for supervisor ${supervisorData.firstName} ${supervisorData.lastName}`);

        for (const memberDoc of teamMembersSnapshot.docs) {
          const memberData = memberDoc.data()
          console.log(`Processing team member: ${memberData.firstName} ${memberData.lastName}`);
          
          const weeklyData = await fetchUserWeeklyData(memberDoc.id, supervisor.id)
          const fourWeekProgress = await fetchUserFourWeekProgress(memberDoc.id)

          teamMembers.push({
            id: memberDoc.id,
            firstName: memberData.firstName || '',
            lastName: memberData.lastName || '',
            role: memberData.role || 'team_member',
            supervisorId: memberData.supervisorId || '',
            weeklyProgress: weeklyData[0] || {
              trainings: [],
              boldActions: [],
              standups: [],
              weekStartDate: new Date()
            },
            allWeeklyData: weeklyData,
            fourWeekProgress
          })
        }

        teamsMetrics.push({
          supervisorName: `${supervisorData.firstName} ${supervisorData.lastName}`,
          teamSize,
          members: teamMembers
        })

        processedSupervisors++
        const supervisorProgress = (processedSupervisors / totalSupervisors) * 60
        setLoadingProgress(30 + supervisorProgress)
      }

      const newMetrics = {
        trainings: { completed: completedTrainings, total: totalTrainings },
        boldActions: { completed: completedBoldActions, total: totalBoldActions },
        standups: { completed: completedStandups, total: totalStandups },
        teams: teamsMetrics
      };

      console.log('Final metrics:', newMetrics);
      setWeeklyMetrics(newMetrics);
      
      setLoadingProgress(100)
      return newMetrics;
    } catch (error) {
      console.error('Error fetching weekly metrics:', error)
      setLoadingProgress(100)
      throw error;
    }
  }, [companyName])

  // Update fetchUsers to get the actual training title
  const fetchUsers = useCallback(async () => {
    try {
      if (!companyName) {
        console.error('Company name not available')
        setError('Company information not available')
        return
      }

      const usersRef = collection(db, 'users')
      const q = query(
        usersRef, 
        where('companyName', '==', companyName),
        where('role', 'in', ['supervisor', 'team_member'])
      )
      const querySnapshot = await getDocs(q)
      
      const usersData = await Promise.all(querySnapshot.docs.map(async userDoc => {
        const userData = userDoc.data()
        
        // Get latest bold action
        const boldActionsRef = collection(db, `users/${userDoc.id}/boldActions`)
        const boldActionsQuery = query(boldActionsRef, orderBy('createdAt', 'desc'), limit(1))
        const boldActionsSnapshot = await getDocs(boldActionsQuery)
        const latestBoldAction = boldActionsSnapshot.docs[0]?.data()
        
        // Get latest training
        const progressRef = doc(db, `users/${userDoc.id}/progress/trainings`)
        const progressDoc = await getDoc(progressRef)
        const progressData = progressDoc.exists() ? progressDoc.data() : {}
        
        // Filter and sort trainings
        const completedTrainings = Object.entries(progressData)
          .filter(([, data]: [string, any]) => data.videoCompleted && data.worksheetCompleted)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data,
            lastUpdated: data.lastUpdated?.toDate?.() || new Date(data.lastUpdated)
          }))
          .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())

        const latestTraining = completedTrainings[0]
        
        // Get the training title from the training document if available
        let trainingTitle = 'Unknown Training';
        if (latestTraining) {
          try {
            const trainingRef = doc(db, 'trainings', latestTraining.id);
            const trainingDoc = await getDoc(trainingRef);
            if (trainingDoc.exists()) {
              trainingTitle = trainingDoc.data().title || `Training ${latestTraining.id}`;
            }
          } catch (error) {
            console.error('Error fetching training title:', error);
          }
        }
        
        return {
          id: userDoc.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || '',
          supervisorId: userData.supervisorId || '',
          latestBoldAction: latestBoldAction ? {
            id: boldActionsSnapshot.docs[0].id,
            action: latestBoldAction.action,
            status: latestBoldAction.status,
            createdAt: formatDate(latestBoldAction.createdAt),
            timeframe: latestBoldAction.timeframe
          } : undefined,
          latestTraining: latestTraining ? {
            id: latestTraining.id,
            title: trainingTitle,
            completedAt: formatDate(latestTraining.lastUpdated)
          } : undefined
        }
      }))
      
      setUsers(usersData)
      return usersData // Return the users data for caching
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
      throw error
    }
  }, [companyName])

  // Update fetchData to handle caching properly
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setLoadingProgress(0)
      
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getCachedData()
        if (cachedData) {
          console.log('Using cached dashboard data')
          setWeeklyMetrics(cachedData.metrics)
          setUsers(cachedData.users)
          setLoading(false)
          return
        }
      }
      
      // Start continuous progress animation
      let progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 0.5;
        });
      }, 100);
      
      try {
        // Fetch both data sets
        const [fetchedUsers, newMetrics] = await Promise.all([
          fetchUsers(),
          fetchWeeklyMetrics()
        ])
        
        // Cache the data if both fetches were successful
        if (fetchedUsers && newMetrics) {
          setCachedData(newMetrics, fetchedUsers)
        }
        
        // Clear interval and set to 100%
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        setLoading(false);
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load dashboard data')
      setLoading(false)
    }
  }, [fetchUsers, fetchWeeklyMetrics])

  useEffect(() => {
    if (userRole !== 'executive') {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      })
      router.push('/')
      return
    }

    // Initial data fetch
    fetchData()

    // Cleanup function
    return () => {
      // No need for cleanup here anymore since intervals are managed in fetchData
    }
  }, [userRole, router, fetchData]) // Add fetchData to dependencies

  const filteredUsers = users.filter(user => {
    const searchString = searchTerm.toLowerCase()
    return (
      user.firstName?.toLowerCase().includes(searchString) ||
      user.lastName?.toLowerCase().includes(searchString) ||
      user.latestBoldAction?.action?.toLowerCase().includes(searchString) ||
      user.latestTraining?.title?.toLowerCase().includes(searchString)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <h2 className="text-xl font-medium text-black">Loading Dashboard...</h2>
        <div className="w-[300px]">
          <Progress 
            value={loadingProgress} 
            className="h-2 transition-all duration-300 ease-in-out [&>div]:bg-[#F5A525]" 
          />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="p-0">
      <div>
        <ExecutiveOverview 
          weeklyTrainings={weeklyMetrics.trainings}
          weeklyBoldActions={weeklyMetrics.boldActions}
          weeklyStandups={weeklyMetrics.standups}
          teams={weeklyMetrics.teams}
        />
      </div>

      <Card className="bg-white rounded-none border-0">
        <CardHeader className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-white">Company Overview</CardTitle>
          <p className="text-white/80">Monitor and manage company-wide progress and performance.</p>
        </CardHeader>
        <CardContent className="p-8">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-8 mb-4 bg-white text-[#333333] border-gray-200"
          />
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-[#333333]">Name</TableHead>
                  <TableHead className="text-[#333333]">Current Bold Action</TableHead>
                  <TableHead className="text-[#333333]">Latest Training</TableHead>
                  <TableHead className="text-[#333333]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-gray-200">
                    <TableCell className="text-[#333333] font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-[#666666]">
                      {user.latestBoldAction ? (
                        <div>
                          <div>{user.latestBoldAction.action}</div>
                          <div className="text-sm text-gray-500">
                            Started: {formatDisplayDate(user.latestBoldAction.createdAt)}
                            <br />
                            Timeframe: {user.latestBoldAction.timeframe}
                          </div>
                        </div>
                      ) : (
                        'No active bold action'
                      )}
                    </TableCell>
                    <TableCell className="text-[#666666]">
                      {user.latestTraining ? (
                        <div>
                          <div>{user.latestTraining.title}</div>
                          <div className="text-sm text-gray-500">
                            Completed: {formatDisplayDate(user.latestTraining.completedAt)}
                          </div>
                        </div>
                      ) : (
                        'No completed trainings'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/user-details/${user.id}`)}
                        variant="outline"
                        size="sm"
                        className="bg-white text-[#333333] border-gray-200 hover:bg-gray-50"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

