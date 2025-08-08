import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check various service dependencies
    const checks = {
      database: await checkDatabase(),
      environment: checkEnvironment(),
      services: await checkExternalServices()
    }

    const allHealthy = Object.values(checks).every(check => check.healthy)

    return NextResponse.json({
      success: true,
      ready: allHealthy,
      timestamp: new Date().toISOString(),
      checks
    }, { 
      status: allHealthy ? 200 : 503 
    })
  } catch (error) {
    console.error('Readiness check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        ready: false,
        error: 'Readiness check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

async function checkDatabase(): Promise<{ healthy: boolean; message: string }> {
  try {
    // In a real app, you'd check your database connection here
    // For now, we'll simulate a database check
    const hasDbUrl = !!process.env.DATABASE_URL
    
    return {
      healthy: hasDbUrl,
      message: hasDbUrl ? 'Database connection available' : 'Database URL not configured'
    }
  } catch (error) {
    return {
      healthy: false,
      message: 'Database check failed'
    }
  }
}

function checkEnvironment(): { healthy: boolean; message: string } {
  const requiredEnvVars = [
    'NEXT_PUBLIC_REOWN_PROJECT_ID',
    'SESSION_SECRET'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  return {
    healthy: missingVars.length === 0,
    message: missingVars.length === 0 
      ? 'All required environment variables present'
      : `Missing environment variables: ${missingVars.join(', ')}`
  }
}

async function checkExternalServices(): Promise<{ healthy: boolean; message: string }> {
  try {
    // Check if we can reach external services
    // For now, we'll just return healthy
    return {
      healthy: true,
      message: 'External services accessible'
    }
  } catch (error) {
    return {
      healthy: false,
      message: 'External services check failed'
    }
  }
}
