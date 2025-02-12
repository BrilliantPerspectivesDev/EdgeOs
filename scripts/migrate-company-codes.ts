import { config } from 'dotenv'
import { resolve } from 'path'
import * as admin from 'firebase-admin'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Initialize Firebase Admin
const serviceAccountPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH!)
const serviceAccount = require(serviceAccountPath)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

const generateCompanyCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

async function migrateCompanyCodes() {
  try {
    // Get all companies
    const companiesRef = db.collection('companies')
    const querySnapshot = await companiesRef.get()

    console.log(`Found ${querySnapshot.size} total companies`)
    let companiesWithoutCode = 0

    for (const doc of querySnapshot.docs) {
      const data = doc.data()
      if (!data.code) {
        companiesWithoutCode++
        let companyCode = generateCompanyCode()
        let isCodeUnique = false
        
        while (!isCodeUnique) {
          // Check if code already exists
          const codeQuery = companiesRef.where('code', '==', companyCode)
          const codeSnapshot = await codeQuery.get()
          
          if (codeSnapshot.empty) {
            isCodeUnique = true
          } else {
            companyCode = generateCompanyCode()
          }
        }

        // Update the company with the new code
        await doc.ref.update({
          code: companyCode
        })

        console.log(`Added code ${companyCode} to company ${doc.id} (${data.name || 'unnamed'})`)
      }
    }

    console.log(`Migration completed successfully. Added codes to ${companiesWithoutCode} companies.`)
    process.exit(0)
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

// Run the migration
migrateCompanyCodes() 