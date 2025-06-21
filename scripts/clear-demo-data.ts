import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDemoData() {
  console.log('🧹 Starting demo data cleanup...')

  try {
    // Delete in order to respect foreign key constraints

    // 1. Delete activity logs (they reference other entities)
    console.log('🗑️ Deleting activity logs...')
    const deletedLogs = await prisma.activityLog.deleteMany({})
    console.log(`   ✅ Deleted ${deletedLogs.count} activity logs`)

    // 2. Delete invoices (they reference orders)
    console.log('🗑️ Deleting invoices...')
    const deletedInvoices = await prisma.invoice.deleteMany({})
    console.log(`   ✅ Deleted ${deletedInvoices.count} invoices`)

    // 3. Delete orders (they reference customers and vendors)
    console.log('🗑️ Deleting orders...')
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`   ✅ Deleted ${deletedOrders.count} orders`)

    // 4. Delete customers
    console.log('🗑️ Deleting customers...')
    const deletedCustomers = await prisma.customer.deleteMany({})
    console.log(`   ✅ Deleted ${deletedCustomers.count} customers`)

    // 5. Delete vendors
    console.log('🗑️ Deleting vendors...')
    const deletedVendors = await prisma.vendor.deleteMany({})
    console.log(`   ✅ Deleted ${deletedVendors.count} vendors`)

    // 6. Delete sub-admin users (keep only main admin)
    console.log('🗑️ Deleting sub-admin users...')

    // First delete their permissions
    const subAdmins = await prisma.user.findMany({
      where: {
        role: 'SUB_ADMIN'
      }
    })

    for (const subAdmin of subAdmins) {
      await prisma.userPermission.deleteMany({
        where: { userId: subAdmin.id }
      })
    }

    // Then delete the sub-admin users
    const deletedSubAdmins = await prisma.user.deleteMany({
      where: {
        role: 'SUB_ADMIN'
      }
    })
    console.log(`   ✅ Deleted ${deletedSubAdmins.count} sub-admin users`)

    // 7. Admin user and permissions are kept as-is
    console.log('✅ Admin user and permissions preserved')

    console.log('\n✅ Demo data cleanup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   🗑️ Activity logs: ${deletedLogs.count} deleted`)
    console.log(`   💰 Invoices: ${deletedInvoices.count} deleted`)
    console.log(`   📋 Orders: ${deletedOrders.count} deleted`)
    console.log(`   👥 Customers: ${deletedCustomers.count} deleted`)
    console.log(`   🏢 Vendors: ${deletedVendors.count} deleted`)
    console.log(`   👤 Sub-admins: ${deletedSubAdmins.count} deleted`)
    console.log(`   👤 Admin user: Preserved`)
    console.log('\n🎯 Your database is now clean and ready for production!')
    console.log('👤 Admin login: admin@innoventory.com / admin123')

  } catch (error) {
    console.error('❌ Error clearing demo data:', error)
    throw error
  }
}

async function main() {
  try {
    await clearDemoData()
  } catch (error) {
    console.error('❌ Failed to clear demo data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
